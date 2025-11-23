import type { LanguageModelMiddleware } from 'ai';

/**
 * Language model middleware for structured logging
 * Logs all model calls, including prompts, responses, and usage
 *
 * Note: This middleware only logs parameters without modification
 * to maintain compatibility with AI SDK v5 parameter handling
 */
export function createLoggingMiddleware(options?: {
  debug?: boolean;
  prefix?: string;
}): LanguageModelMiddleware {
  const debug = options?.debug ?? false;
  const prefix = options?.prefix ?? '[AI]';

  return {
    transformParams: async (params: any) => {
      try {
        if (debug && params) {
          // Safely extract logging information without modifying params
          const messageCount = Array.isArray(params.messages) ? params.messages.length : 0;
          const toolCount = params.tools ? Object.keys(params.tools).length : 0;

          console.log(`${prefix} Model Request:`, {
            messageCount,
            toolCount,
            maxTokens: params.maxTokens,
            temperature: params.temperature,
          });
        }
      } catch (error) {
        // Silently catch logging errors to prevent middleware from breaking the call
        if (debug) console.error(`${prefix} Logging error:`, error);
      }

      // Always return params unmodified
      return params;
    },
  };
}

/**
 * Format usage information for logging
 */
export function formatUsage(usage: {
  promptTokens: number;
  completionTokens: number;
}) {
  const total = usage.promptTokens + usage.completionTokens;
  return `Tokens: ${total} (in: ${usage.promptTokens}, out: ${usage.completionTokens})`;
}

/**
 * Log API call metrics
 */
export interface CallMetrics {
  modelId: string;
  duration: number;
  promptTokens: number;
  completionTokens: number;
  toolCalls?: number;
  error?: boolean;
}

/**
 * Log model call with metrics
 */
export function logModelCall(metrics: CallMetrics) {
  const duration = metrics.duration;
  const tokens = metrics.promptTokens + metrics.completionTokens;
  const status = metrics.error ? '❌' : '✅';

  console.log(
    `${status} [${metrics.modelId}] ${duration}ms | ${tokens} tokens` +
      (metrics.toolCalls ? ` | ${metrics.toolCalls} tools` : '')
  );
}
