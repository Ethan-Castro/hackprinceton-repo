import { convertToModelMessages, type UIMessage } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/constants";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { queryWithPostgres } from "@/lib/neon";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
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
  });

  const providerMetadataPromise = result.providerMetadata;
  const usagePromise = result.usage;

  result.response
    .then(async () => {
      try {
        const metadata = await providerMetadataPromise;
        const metadataRecord = metadata as Record<string, unknown> | undefined;
        if (metadataRecord && typeof metadataRecord.generationId === "string") {
          const generationId = metadataRecord.generationId;
          const providerValue = metadataRecord.provider;
          const costValue = metadataRecord.cost;
          const latencyValue = metadataRecord.latency;
          const generationTimeValue = metadataRecord.generationTime;
          const isByokValue = metadataRecord.isByok;

          const providerName =
            typeof providerValue === "string"
              ? providerValue
              : providerValue != null
                ? String(providerValue)
                : null;
          const totalCost =
            typeof costValue === "number"
              ? costValue
              : costValue != null
                ? Number(costValue)
                : null;
          const latency =
            typeof latencyValue === "number"
              ? latencyValue
              : latencyValue != null
                ? Number(latencyValue)
                : null;
          const generationTime =
            typeof generationTimeValue === "number"
              ? generationTimeValue
              : generationTimeValue != null
                ? Number(generationTimeValue)
                : null;
          const isByok =
            typeof isByokValue === "boolean"
              ? isByokValue
              : Boolean(isByokValue);

          const usage = await usagePromise;

          const promptTokens = usage?.inputTokens ?? null;
          const completionTokens = usage?.outputTokens ?? null;

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
              ${providerName},
              ${totalCost},
              ${promptTokens},
              ${completionTokens},
              ${latency},
              ${generationTime},
              ${isByok},
              ${true}
            )
            ON CONFLICT (generation_id) DO NOTHING
          `;

          console.log(`[Chat] Captured generation ID: ${generationId}`);
        }
      } catch (error) {
        console.error("[Chat] Error saving generation:", error);
      }
    })
    .catch((error) => {
      console.error("Error while streaming.", error);
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: supportsReasoning,
    });
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
