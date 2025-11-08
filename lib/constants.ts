export const DEFAULT_MODEL = "cerebras/llama3.1-8b";

// Cerebras models (via AI Gateway)
export const CEREBRAS_MODELS = [
  "cerebras/llama3.1-8b",
  "cerebras/llama-3.3-70b",
  "cerebras/gpt-oss-120b",
  "cerebras/qwen-3-235b-a22b-instruct-2507",
  "cerebras/qwen-3-235b-a22b-thinking-2507",
  "cerebras/qwen-3-32b",
  "cerebras/qwen-3-coder-480b",
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
