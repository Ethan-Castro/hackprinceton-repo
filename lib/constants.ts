export const DEFAULT_MODEL = "llama3.1-8b";

// Direct Cerebras models (via @ai-sdk/cerebras)
export const CEREBRAS_MODELS = [
  "llama3.1-8b",
  "llama-3.3-70b",
  "gpt-oss-120b",
  "qwen-3-235b-a22b-instruct-2507",
  "qwen-3-235b-a22b-thinking-2507",
  "qwen-3-32b",
  "qwen-3-coder-480b",
];

// Gateway models (via @ai-sdk/gateway)
export const GATEWAY_MODELS = [
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-haiku-4.5",
  "google/gemini-2.5-flash",
];

export const SUPPORTED_MODELS = [...CEREBRAS_MODELS, ...GATEWAY_MODELS];
