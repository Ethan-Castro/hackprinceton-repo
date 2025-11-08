import { gateway } from "@/lib/gateway";
import { NextResponse } from "next/server";
import { GATEWAY_MODELS, CEREBRAS_MODELS } from "@/lib/constants";

// Cerebras model metadata
const CEREBRAS_MODEL_INFO = [
  {
    id: "llama3.1-8b",
    name: "Llama 3.1 8B",
    description:
      "Fast and efficient 8B parameter model with tool usage and streaming support.",
    modelType: "language",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    description:
      "Powerful 70B parameter model with enhanced reasoning capabilities.",
    modelType: "language",
  },
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Open-source GPT model with 120B parameters.",
    modelType: "language",
  },
  {
    id: "qwen-3-235b-a22b-instruct-2507",
    name: "Qwen 3 235B Instruct",
    description: "Instruction-tuned Qwen 3 model with 235B parameters.",
    modelType: "language",
  },
  {
    id: "qwen-3-235b-a22b-thinking-2507",
    name: "Qwen 3 235B Thinking",
    description:
      "Reasoning-focused Qwen 3 model with enhanced thinking capabilities.",
    modelType: "language",
  },
  {
    id: "qwen-3-32b",
    name: "Qwen 3 32B",
    description: "Balanced 32B parameter model for general tasks.",
    modelType: "language",
  },
  {
    id: "qwen-3-coder-480b",
    name: "Qwen 3 Coder 480B",
    description:
      "Specialized coding model with 480B parameters for programming tasks.",
    modelType: "language",
  },
];

export async function GET() {
  try {
    // Get gateway models
    const allModels = await gateway.getAvailableModels();
    const gatewayModels = allModels.models
      .filter((model) => GATEWAY_MODELS.includes(model.id))
      .map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description || "",
        modelType: model.modelType || "language",
      }));

    // Add Cerebras models (already in correct format)
    const cerebrasModels = CEREBRAS_MODEL_INFO.filter((model) =>
      CEREBRAS_MODELS.includes(model.id)
    );

    // Combine and ensure all models have required fields
    const allAvailableModels = [...cerebrasModels, ...gatewayModels].map(
      (model) => ({
        id: model.id,
        name: model.name,
        description: model.description || "",
        modelType: model.modelType || "language",
      })
    );

    // Verify we have all expected models
    const expectedModelIds = [...CEREBRAS_MODELS, ...GATEWAY_MODELS];
    const availableModelIds = allAvailableModels.map((m) => m.id);
    const missingModels = expectedModelIds.filter(
      (id) => !availableModelIds.includes(id)
    );

    if (missingModels.length > 0) {
      console.warn(
        `Warning: Some expected models are not available: ${missingModels.join(", ")}`
      );
    }

    return NextResponse.json({
      models: allAvailableModels,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    // Return Cerebras models at minimum if gateway fails
    const cerebrasModels = CEREBRAS_MODEL_INFO.filter((model) =>
      CEREBRAS_MODELS.includes(model.id)
    );
    return NextResponse.json(
      {
        models: cerebrasModels,
        error: "Failed to fetch gateway models",
      },
      { status: 200 } // Still return 200 so UI can show Cerebras models
    );
  }
}
