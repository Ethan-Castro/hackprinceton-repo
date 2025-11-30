import { CEREBRAS_MODELS, GATEWAY_MODELS } from '@/lib/constants';

export type ModelProvider = 'cerebras' | 'gateway';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ModelProvider;
}

const MODEL_DEFINITIONS: ModelDefinition[] = [
  // Cerebras models (priority order)
  { id: 'cerebras/zai-glm-4.6', name: 'ZAI GLM 4.6 ⚡️', provider: 'cerebras' },
  { id: 'cerebras/gpt-oss-120b', name: 'GPT-OSS 120B ⚡️', provider: 'cerebras' },
  { id: 'cerebras/llama-3.3-70b', name: 'Llama 3.3 70B ⚡️', provider: 'cerebras' },

  // Claude models (priority order)
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'gateway' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'gateway' },
  { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'gateway' },

  // Google models (priority order)
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gateway' },
  { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', provider: 'gateway' },

  // Additional Cerebras models
  { id: 'cerebras/llama3.1-8b', name: 'Llama 3.1 8B ⚡️', provider: 'cerebras' },
  { id: 'cerebras/qwen-3-235b-a22b-instruct-2507', name: 'Qwen 3 235B Instruct ⚡️', provider: 'cerebras' },
  { id: 'cerebras/qwen-3-235b-a22b-thinking-2507', name: 'Qwen 3 235B Thinking ⚡️', provider: 'cerebras' },
  { id: 'cerebras/qwen-3-32b', name: 'Qwen 3 32B ⚡️', provider: 'cerebras' },
  { id: 'cerebras/qwen-3-coder-480b', name: 'Qwen 3 Coder 480B ⚡️', provider: 'cerebras' },

  // Other providers
  { id: 'xai/grok-4-fast-non-reasoning', name: 'Grok 4 Fast', provider: 'gateway' },
  { id: 'moonshotai/kimi-k2-thinking-turbo', name: 'Kimi K2 Thinking Turbo', provider: 'gateway' },

  // Groq models (via gateway)
  { id: 'groq/moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2 Instruct (Groq)', provider: 'gateway' },
  { id: 'groq/qwen/qwen3-32b', name: 'Qwen 3 32B (Groq)', provider: 'gateway' },
];

const PROVIDER_ENVIRONMENT: Record<ModelProvider, () => boolean> = {
  cerebras: () => Boolean(process.env.CEREBRAS_API_KEY),
  gateway: () => Boolean(process.env.AI_GATEWAY_API_KEY),
};

export function getModelDefinitions(): ModelDefinition[] {
  return MODEL_DEFINITIONS;
}

export function getModelDefinition(modelId: string): ModelDefinition | undefined {
  return MODEL_DEFINITIONS.find((def) => def.id === modelId);
}

export function isProviderConfigured(provider: ModelProvider): boolean {
  return PROVIDER_ENVIRONMENT[provider]();
}

export function isModelEnabled(modelId: string): boolean {
  const definition = getModelDefinition(modelId);
  if (!definition) return false;
  return isProviderConfigured(definition.provider);
}

export function getEnabledModelDefinitions(): ModelDefinition[] {
  return MODEL_DEFINITIONS.filter((definition) => isProviderConfigured(definition.provider));
}

export function getProviderStatus(): Record<ModelProvider, boolean> {
  return {
    cerebras: isProviderConfigured('cerebras'),
    gateway: isProviderConfigured('gateway'),
  };
}

export function hasAnyConfiguredProviders(): boolean {
  return getEnabledModelDefinitions().length > 0;
}

export function getDefaultEnabledModelId(): string {
  const enabled = getEnabledModelDefinitions();
  if (enabled.length > 0) return enabled[0].id;
  return CEREBRAS_MODELS[0] ?? GATEWAY_MODELS[0];
}
