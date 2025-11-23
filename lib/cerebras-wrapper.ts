import type { LanguageModel } from "ai";
import { wrapLanguageModel } from "ai";
import { createLoggingMiddleware } from "./middleware/logging";
import { createCachingMiddleware } from "./middleware/caching";

/**
 * Wrap Cerebras models with middleware and compatibility fixes.
 *
 * Cerebras models are wrapped with:
 * - Logging middleware for observability
 * - Caching middleware for performance (optional)
 *
 * Supported Cerebras models (llama-3.3-70b, gpt-oss-120b) work correctly with tools.
 * Models that don't support tools have been removed from CEREBRAS_MODELS in lib/constants.ts.
 */
export function wrapCerebrasModel(
  baseModel: LanguageModel,
  options?: { enableCaching?: boolean; debug?: boolean }
): LanguageModel {
  // Apply middleware layers: logging -> caching
  let wrapped: any = baseModel;

  // Add logging middleware
  wrapped = wrapLanguageModel({
    model: wrapped,
    middleware: createLoggingMiddleware({
      debug: options?.debug ?? false,
      prefix: "[Cerebras]",
    }),
  });

  // Add optional caching middleware
  if (options?.enableCaching ?? true) {
    wrapped = wrapLanguageModel({
      model: wrapped,
      middleware: createCachingMiddleware({
        enabled: true,
        debug: options?.debug ?? false,
      }),
    });
  }

  return wrapped;
}

