export const DEFAULT_MODEL = "cerebras/zai-glm-4.6";

// Cerebras models that support tools (all Cerebras models must support tools)
// Previously removed models that don't support tools with streaming:
// - cerebras/llama3.1-8b (response_format incompatibility)
// - cerebras/qwen-3-coder-480b (not available)
// Note: Some models below may have limited compatibility with streaming + tools
export const CEREBRAS_MODELS = [
  "cerebras/llama-3.3-70b",
  "cerebras/gpt-oss-120b",
  "cerebras/qwen-3-235b-a22b-instruct-2507",
  "cerebras/qwen-3-235b-a22b-thinking-2507",
  "cerebras/zai-glm-4.6",
];

// Gateway models (via @ai-sdk/gateway)
export const GATEWAY_MODELS = [
  "anthropic/claude-haiku-4.5",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-opus-4.5",
  "google/gemini-2.5-flash",
  "google/gemini-3-pro",
  "xai/grok-4-fast-non-reasoning",
  "moonshotai/kimi-k2-thinking-turbo",
  "groq/moonshotai/kimi-k2-instruct-0905",
  "groq/qwen/qwen3-32b",
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
  "cerebras/qwen-3-235b-a22b-thinking-2507": { supportsReasoning: true },
  "cerebras/zai-glm-4.6": { supportsReasoning: true },

  // Non-reasoning models (explicitly false or omitted)
  "cerebras/llama-3.3-70b": { supportsReasoning: false },
  "cerebras/gpt-oss-120b": { supportsReasoning: false },
  "cerebras/qwen-3-235b-a22b-instruct-2507": { supportsReasoning: false },
  "anthropic/claude-haiku-4.5": { supportsReasoning: false },
  "anthropic/claude-sonnet-4.5": { supportsReasoning: false },
  "anthropic/claude-opus-4.5": { supportsReasoning: true },
  "google/gemini-2.5-flash": { supportsReasoning: false },
  "google/gemini-3-pro": { supportsReasoning: true },
  "xai/grok-4-fast-non-reasoning": { supportsReasoning: false },
  "groq/moonshotai/kimi-k2-instruct-0905": { supportsReasoning: false },
  "groq/qwen/qwen3-32b": { supportsReasoning: false },
};
