import type { LanguageModel } from "ai";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
import { CEREBRAS_MODELS, MODEL_METADATA } from "@/lib/constants";
// TODO: Re-enable imports after fixing middleware parameter handling
// import { wrapCerebrasModel } from "@/lib/cerebras-wrapper";
// import { wrapGatewayModel } from "@/lib/gateway-wrapper";

export interface ResolvedModel {
  model: LanguageModel;
  useTools: boolean;
  supportsReasoning: boolean;
}

export function resolveModel(modelId: string): ResolvedModel {
  const isCerebrasModel = CEREBRAS_MODELS.includes(modelId);
  
  // Validate API keys before creating models
  if (isCerebrasModel) {
    if (!process.env.CEREBRAS_API_KEY) {
      throw new Error(
        `CEREBRAS_API_KEY is required for Cerebras models. Please add it to your .env.local file.`
      );
    }
  } else {
    if (!process.env.AI_GATEWAY_API_KEY) {
      throw new Error(
        `AI_GATEWAY_API_KEY is required for gateway models. Please add it to your .env.local file.`
      );
    }
  }

  const cleanedModelId = isCerebrasModel
    ? modelId.replace(/^cerebras\//, "")
    : modelId;

  let model: LanguageModel;
  if (isCerebrasModel) {
    const baseModel = createCerebras({
      apiKey: process.env.CEREBRAS_API_KEY!,
    })(cleanedModelId);
    // TODO: Re-enable middleware wrapping after fixing parameter handling
    // Currently disabled due to "prompt is not iterable" error in AI SDK v5
    // model = wrapCerebrasModel(baseModel, { enableCaching: true });
    model = baseModel;
  } else {
    const baseModel = gateway(modelId);
    // TODO: Re-enable middleware wrapping after fixing parameter handling
    // Currently disabled due to "prompt is not iterable" error in AI SDK v5
    // model = wrapGatewayModel(baseModel, { enableCaching: true });
    model = baseModel;
  }

  // Use explicit model metadata for feature detection
  // Falls back to false if model is not in metadata
  const supportsReasoning = MODEL_METADATA[modelId]?.supportsReasoning ?? false;

  return {
    model,
    useTools: true, // All supported models now support tools
    supportsReasoning,
  };
}
