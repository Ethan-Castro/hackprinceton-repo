import { convertToModelMessages, type UIMessage } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/constants";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { queryWithPostgres } from "@/lib/neon";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    modelId = DEFAULT_MODEL,
  }: { messages: UIMessage[]; modelId: string } = await req.json();

  if (!SUPPORTED_MODELS.includes(modelId)) {
    return new Response(
      JSON.stringify({ error: `Model ${modelId} is not supported` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { agent, supportsReasoning } = createChatAgent(modelId);

  const result = agent.stream({
    messages: convertToModelMessages(messages),
    onFinish: async ({ response }) => {
      // Capture generation ID from providerMetadata
      try {
        const metadata = response.providerMetadata;
        if (metadata && 'generationId' in metadata) {
          const generationId = metadata.generationId as string;

          // Store generation info in database
          await queryWithPostgres`
            INSERT INTO generations (
              generation_id,
              model,
              provider_name,
              total_cost,
              tokens_prompt,
              tokens_completion,
              latency,
              generation_time,
              is_byok,
              streamed
            ) VALUES (
              ${generationId},
              ${modelId},
              ${'provider' in metadata ? String(metadata.provider) : null},
              ${'cost' in metadata ? Number(metadata.cost) : null},
              ${response.usage?.promptTokens ?? null},
              ${response.usage?.completionTokens ?? null},
              ${'latency' in metadata ? Number(metadata.latency) : null},
              ${'generationTime' in metadata ? Number(metadata.generationTime) : null},
              ${'isByok' in metadata ? Boolean(metadata.isByok) : false},
              ${true}
            )
            ON CONFLICT (generation_id) DO NOTHING
          `;

          console.log(`[Chat] Captured generation ID: ${generationId}`);
        }
      } catch (error) {
        console.error("[Chat] Error saving generation:", error);
      }
    },
    onError: (e) => {
      console.error("Error while streaming.", e);
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}
