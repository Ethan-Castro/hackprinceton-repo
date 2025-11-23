import { convertToModelMessages, type UIMessage } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/constants";
import { createHealthAgent } from "@/lib/agents/health-agent";

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
  });

  result.response
    .then(closeResources)
    .catch((e) => {
      console.error("Error while streaming (health chat).", e);
      return closeResources();
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: supportsReasoning,
    });
  } catch (error: any) {
    console.error("[Health Chat] Error:", error);
    
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
        error: error.message || "Failed to process health chat request"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
