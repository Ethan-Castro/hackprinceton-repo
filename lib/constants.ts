export const DEFAULT_MODEL = "cerebras/gpt-oss-120b";

// Cerebras models that support tools (all Cerebras models must support tools)
// Removed models that don't support tools with streaming:
// - cerebras/llama3.1-8b (response_format incompatibility)
// - cerebras/qwen-3-235b-a22b-instruct-2507 (response_format incompatibility)
// - cerebras/qwen-3-235b-a22b-thinking-2507 (reasoning models don't support stream+tools)
// - cerebras/qwen-3-32b (reasoning models don't support stream+tools)
// - cerebras/qwen-3-coder-480b (not available)
export const CEREBRAS_MODELS = [
  "cerebras/llama-3.3-70b",
  "cerebras/gpt-oss-120b",
];

// Gateway models (via @ai-sdk/gateway)
export const GATEWAY_MODELS = [
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-haiku-4.5",
  "google/gemini-2.5-flash",
  "xai/grok-4-fast-non-reasoning",
  "moonshotai/kimi-k2-thinking-turbo",
];

export const SUPPORTED_MODELS = [...CEREBRAS_MODELS, ...GATEWAY_MODELS];

// Model metadata for feature detection
// This provides explicit configuration instead of string matching
export interface ModelMetadata {
  supportsReasoning?: boolean;
}

export const MODEL_METADATA: Record<string, ModelMetadata> = {
  // Reasoning-capable models
  "moonshotai/kimi-k2-thinking-turbo": { supportsReasoning: true },

  // Non-reasoning models (explicitly false or omitted)
  "cerebras/llama-3.3-70b": { supportsReasoning: false },
  "cerebras/gpt-oss-120b": { supportsReasoning: false },
  "anthropic/claude-sonnet-4.5": { supportsReasoning: false },
  "anthropic/claude-haiku-4.5": { supportsReasoning: false },
  "google/gemini-2.5-flash": { supportsReasoning: false },
  "xai/grok-4-fast-non-reasoning": { supportsReasoning: false },
};
