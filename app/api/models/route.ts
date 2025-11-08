import { NextResponse } from "next/server";
import { SUPPORTED_MODELS } from "@/lib/constants";

// Model display names for better UX
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Cerebras models
  "cerebras/llama3.1-8b": "Llama 3.1 8B (Cerebras)",
  "cerebras/llama-3.3-70b": "Llama 3.3 70B (Cerebras)",
  "cerebras/gpt-oss-120b": "GPT-OSS 120B (Cerebras)",
  "cerebras/qwen-3-235b-a22b-instruct-2507": "Qwen 3 235B Instruct (Cerebras)",
  "cerebras/qwen-3-235b-a22b-thinking-2507": "Qwen 3 235B Thinking (Cerebras)",
  "cerebras/qwen-3-32b": "Qwen 3 32B (Cerebras)",
  "cerebras/qwen-3-coder-480b": "Qwen 3 Coder 480B (Cerebras)",
  
  // Anthropic models
  "anthropic/claude-sonnet-4.5": "Claude Sonnet 4.5",
  "anthropic/claude-haiku-4.5": "Claude Haiku 4.5",
  
  // Google models
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  
  // xAI models
  "xai/grok-4-fast-non-reasoning": "Grok 4 Fast",
  
  // Moonshot models
  "moonshotai/kimi-k2-thinking-turbo": "Kimi K2 Thinking Turbo",
};

export async function GET() {
  try {
    console.log("[Models API] Returning configured models...");
    
    // Return all configured models
    const allAvailableModels = SUPPORTED_MODELS.map((id) => ({
      id,
      name: MODEL_DISPLAY_NAMES[id] || id,
      description: "",
      modelType: "language",
    }));

    console.log(`[Models API] Returning ${allAvailableModels.length} models`);

    return NextResponse.json({
      models: allAvailableModels,
    });
  } catch (error) {
    console.error("[Models API] Error:", error);
    
    return NextResponse.json(
      {
        models: [],
        error: "Failed to fetch models",
      },
      { status: 500 }
    );
  }
}
