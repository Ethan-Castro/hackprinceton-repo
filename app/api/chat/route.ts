import { convertToModelMessages, type UIMessage, createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/constants";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { getLatestGenerationId, clearGenerationId, setGenerationId } from "@/lib/gateway";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const requestStart = Date.now();
    let firstTokenAt: number | null = null;
    let completionChars = 0;
    let responseAny: any = null;

    const {
      messages,
      modelId = DEFAULT_MODEL,
      enableAllTools = false,
      activeTools,
      toolScope,
    }: {
      messages: UIMessage[];
      modelId: string;
      enableAllTools?: boolean;
      activeTools?: Array<string>;
      toolScope?: string;
    } = await req.json();

    if (!SUPPORTED_MODELS.includes(modelId)) {
      return new Response(
        JSON.stringify({ error: `Model ${modelId} is not supported` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedActiveTools = Array.isArray(activeTools)
      ? activeTools.filter((toolName): toolName is string => typeof toolName === "string")
      : undefined;

    const { agent, supportsReasoning } = createChatAgent(modelId, undefined, {
      enableAllTools: enableAllTools || toolScope === "all",
      activeTools: normalizedActiveTools,
    });

  // Clear any previous generation ID before new request
  clearGenerationId();

  const result = agent.stream({
    messages: convertToModelMessages(messages),
  });

  // Create a custom UI message stream that includes generation metadata
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Get the agent's stream and forward all chunks
      const agentStream = result.toUIMessageStream({ sendReasoning: supportsReasoning });

      for await (const chunk of agentStream) {
        // Filter out 'finish' events that aren't valid UI message stream parts
        const chunkAny = chunk as any;
        if (chunkAny?.type === "finish") {
          console.log("[Chat] Saw finish chunk (inspecting for generationId)", {
            keys: Object.keys(chunkAny || {}),
            finishReason: chunkAny?.finishReason,
            id: chunkAny?.id,
            data: chunkAny?.data,
          });
          continue;
        }

        // Track first token/time and rough token count from streamed text deltas
        const now = Date.now();
        if (
          chunkAny?.type === "text-delta" &&
          typeof chunkAny.delta === "string" &&
          chunkAny.delta.length > 0
        ) {
          if (firstTokenAt === null) {
            firstTokenAt = now;
          }
          completionChars += chunkAny.delta.length;
        } else if (
          chunkAny?.type === "reasoning-delta" &&
          typeof chunkAny.delta === "string" &&
          chunkAny.delta.length > 0
        ) {
          if (firstTokenAt === null) {
            firstTokenAt = now;
          }
          completionChars += chunkAny.delta.length;
        }

        // Defensive: only forward chunks that match the expected UI message parts
        try {
          writer.write(chunk);
        } catch (error) {
          console.error("[Chat] Skipping invalid stream chunk:", {
            type: chunkAny?.type,
            keys: Object.keys(chunkAny || {}),
            error,
          });
        }
      }

      // After streaming completes, get and send the generationId as a data part
      try {
        console.log("[Chat] Starting generationId resolution");

        // First try to get generation ID from response headers (captured by gateway wrapper)
        let generationId = getLatestGenerationId();
        console.log("[Chat] getLatestGenerationId():", generationId);

        // If not found in headers, check the response object
        if (!generationId) {
          console.log("[Chat] No generationId from wrapper, inspecting response");
          const response = await result.response;
          responseAny = response as any;
          console.log(`[Chat] Response keys:`, Object.keys(responseAny || {}));
          console.log(`[Chat] Response id:`, responseAny?.id);
          console.log(`[Chat] Response modelId:`, responseAny?.modelId);
          console.log(`[Chat] Response headers:`, responseAny?.headers);

          // Try common header names on the response object
          const headers = responseAny?.headers;
          const getHeader = (name: string): string | null => {
            if (!headers) return null;
            try {
              if (typeof headers.get === "function") {
                return headers.get(name);
              }
              // Handle plain object shape
              const lower = name.toLowerCase();
              return headers[name] || headers[lower] || null;
            } catch {
              return null;
            }
          };

          const headerId =
            getHeader("x-vercel-ai-generation-id") ||
            getHeader("x-generation-id") ||
            getHeader("generation-id") ||
            getHeader("x-request-id");
          const headerEntries = headers
            ? Object.fromEntries(
                typeof headers.entries === "function"
                  ? headers.entries()
                  : Object.entries(headers)
              )
            : {};
          console.log("[Chat] All response headers:", headerEntries);
          const headerGen =
            headerId && /^gen_[A-Za-z0-9]+/.test(headerId)
              ? headerId
              : Object.values(headerEntries).find(
                  (v) => typeof v === "string" && /^gen_[A-Za-z0-9]+/.test(v)
                );
          if (!generationId && headerGen) {
            generationId = headerGen as string;
            console.log(`[Chat] Found generation ID in headers:`, generationId);
          } else if (!generationId && headerId) {
            console.log(
              `[Chat] Header candidate not in gen_* format, skipping: ${headerId}`
            );
          }

          // Check for id in response (OpenAI-compatible format)
          if (!generationId && responseAny?.id && typeof responseAny.id === "string") {
            if (/^gen_[A-Za-z0-9]+/.test(responseAny.id)) {
              generationId = responseAny.id;
            } else {
              console.log(
                `[Chat] Response.id not in gen_* format (value: ${responseAny.id}), not using for metrics`
              );
            }
          }
        }

        // If still not found, try providerMetadata as fallback
        if (!generationId) {
          console.log("[Chat] No generationId yet, inspecting providerMetadata");
          const metadata = await result.providerMetadata;
          console.log(`[Chat] Provider metadata:`, JSON.stringify(metadata, null, 2));

          const metadataRecord = metadata as Record<string, unknown> | undefined;

          if (metadataRecord) {
            // Check various possible locations
            const metaCandidates: Array<unknown> = [
              metadataRecord.generationId,
              (metadataRecord.gateway as any)?.generationId,
              metadataRecord.id,
            ];
            for (const candidate of metaCandidates) {
              if (typeof candidate === "string" && /^gen_[A-Za-z0-9]+/.test(candidate)) {
                generationId = candidate;
                console.log(`[Chat] Found generation ID in metadata: ${generationId}`);
                break;
              }
            }
          }
        }

        if (generationId) {
          // Store the generation ID so the client can fetch it
          setGenerationId(generationId);
          console.log(`[Chat] Stored generation ID: ${generationId}`);
        } else {
          console.log(`[Chat] No generationId found from headers, response, or metadata`);
        }

        // Compute locally-computed performance metrics to the client (no gateway required)
        const streamEnd = Date.now();
        const latency = firstTokenAt ? firstTokenAt - requestStart : null;
        const generationTime = streamEnd - requestStart;
        const streamingDuration =
          latency !== null ? Math.max(0, generationTime - latency) : generationTime;
        // Rough token estimate: chars / 4
        const tokensCompletion =
          completionChars > 0 ? Math.max(1, Math.round(completionChars / 4)) : null;
        const tokensPerSecond =
          tokensCompletion && streamingDuration > 0
            ? Number((tokensCompletion / (streamingDuration / 1000)).toFixed(2))
            : null;

        writer.write({
          type: "data-local-metrics",
          data: [
            {
              kind: "local-metrics",
              metrics: {
                latency,
                generationTime,
                tokensPerSecond,
                tokensPrompt: null,
                tokensCompletion,
                tokensReasoning: null,
                generationId: generationId ?? null,
                model: responseAny?.modelId ?? modelId ?? null,
                providerName: null,
                createdAt: new Date(streamEnd).toISOString(),
              },
            },
          ],
        } as any);
        console.log("[Chat] Sent local metrics to client:", {
          latency,
          generationTime,
          tokensPerSecond,
          tokensCompletion,
          generationId,
        });

        // Also emit as message metadata so the client can read it via onFinish/message metadata
        writer.write({
          type: "message-metadata",
          metadata: {
            localMetrics: {
              latency,
              generationTime,
              tokensPerSecond,
              tokensPrompt: null,
              tokensCompletion,
              tokensReasoning: null,
              generationId: generationId ?? null,
              model: responseAny?.modelId ?? modelId ?? null,
              providerName: null,
              createdAt: new Date(streamEnd).toISOString(),
            },
          },
        } as any);
      } catch (error) {
        console.error("[Chat] Error getting generation metadata:", error);
      }
    },
    onError: (error: unknown) => {
      console.error("[Chat] Stream error:", error);
      return error instanceof Error ? error.message : "Stream error occurred";
    },
  });

  return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    console.error("[Chat] Error:", error);
    
    // Handle API key errors specifically
    if (error.message?.includes("API_KEY")) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: "Please check your .env.local file and ensure the required API keys are set"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to process chat request"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
