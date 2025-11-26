import { NextRequest, NextResponse } from "next/server";
import {
  generateDashboardFromText,
  refineDashboardCode,
  generateDashboardDirect,
} from "@/lib/agents/dashboard-generator";
import { SUPPORTED_MODELS, DEFAULT_MODEL } from "@/lib/constants";

export const maxDuration = 60;

interface GenerateDashboardRequest {
  text: string;
  goal?: string;
  modelId?: string;
  currentCode?: string; // For refinement mode
  isRefinement?: boolean;
  skipDataCleaning?: boolean; // For pre-structured data
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateDashboardRequest = await req.json();
    const {
      text,
      goal = "Create an interactive dashboard visualizing this data",
      modelId = "anthropic/claude-sonnet-4.5",
      currentCode,
      isRefinement = false,
      skipDataCleaning = false,
    } = body;

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    // Validate model if provided
    if (modelId && !SUPPORTED_MODELS.includes(modelId)) {
      console.warn(
        `[Generate Dashboard] Model ${modelId} not in supported list, using anyway`
      );
    }

    // Check API keys
    const isCerebrasModel = modelId.startsWith("cerebras/");
    if (isCerebrasModel && !process.env.CEREBRAS_API_KEY) {
      return NextResponse.json(
        {
          error: "CEREBRAS_API_KEY is required for Cerebras models",
          details: "Please add CEREBRAS_API_KEY to your .env.local file",
        },
        { status: 500 }
      );
    }
    if (!isCerebrasModel && !process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        {
          error: "AI_GATEWAY_API_KEY is required for gateway models",
          details: "Please add AI_GATEWAY_API_KEY to your .env.local file",
        },
        { status: 500 }
      );
    }

    const options = { modelId };

    let result;

    if (isRefinement && currentCode) {
      // Refinement mode: modify existing dashboard
      console.log("[Generate Dashboard] Refinement mode - modifying existing code");
      result = await refineDashboardCode(currentCode, text, options);
    } else if (skipDataCleaning) {
      // Direct mode: skip data cleaning, generate dashboard directly
      console.log("[Generate Dashboard] Direct mode - skipping data cleaning");
      result = await generateDashboardDirect(text, goal, options);
    } else {
      // Full mode: clean data then generate dashboard
      console.log("[Generate Dashboard] Full mode - cleaning data then generating");
      result = await generateDashboardFromText(text, goal, options);
    }

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("[Generate Dashboard] Error:", error);

    // Handle specific error types
    if (error.message?.includes("API_KEY")) {
      return NextResponse.json(
        {
          error: error.message,
          details: "Please check your .env.local file and ensure the required API keys are set",
        },
        { status: 500 }
      );
    }

    if (error.message?.includes("rate limit")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: "Please try again in a few moments",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to generate dashboard",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "generate-dashboard",
    capabilities: [
      "Generate interactive React dashboards from text/PDF data",
      "Refine existing dashboards based on user feedback",
      "Two-pass strategy: clean data then generate code",
      "Direct generation for pre-structured data",
    ],
    supportedModels: SUPPORTED_MODELS,
    defaultModel: "anthropic/claude-sonnet-4.5",
  });
}

