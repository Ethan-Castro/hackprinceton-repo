import type { LanguageModel } from "ai";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
import { CEREBRAS_MODELS } from "@/lib/constants";

export interface ResolvedModel {
  model: LanguageModel;
  useTools: boolean;
  supportsReasoning: boolean;
}

export function resolveModel(modelId: string): ResolvedModel {
  const isCerebrasModel = CEREBRAS_MODELS.includes(modelId);
  const cleanedModelId = isCerebrasModel
    ? modelId.replace(/^cerebras\//, "")
    : modelId;

  const model = isCerebrasModel
    ? createCerebras({
        apiKey: process.env.CEREBRAS_API_KEY,
      })(cleanedModelId)
    : gateway(modelId);

  const supportsReasoning =
    modelId.toLowerCase().includes("thinking") ||
    modelId.toLowerCase().includes("deepseek");

  return {
    model,
    useTools: true, // All models support tools according to their documentation
    supportsReasoning,
  };
}
