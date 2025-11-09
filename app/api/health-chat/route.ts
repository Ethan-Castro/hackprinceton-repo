import { convertToModelMessages, type UIMessage } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/constants";
import { createHealthAgent } from "@/lib/agents/health-agent";

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

  const { agent, supportsReasoning, cleanup } = await createHealthAgent(modelId);
  let cleanupCalled = false;
  const closeResources = async () => {
    if (cleanup && !cleanupCalled) {
      cleanupCalled = true;
      await cleanup();
    }
  };

  const result = agent.stream({
    messages: convertToModelMessages(messages),
    onFinish: async () => {
      await closeResources();
    },
    onError: (e) => {
      console.error("Error while streaming (health chat).", e);
      void closeResources();
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}
