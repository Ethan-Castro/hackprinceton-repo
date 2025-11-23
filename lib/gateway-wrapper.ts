import type { LanguageModel } from "ai";
import { wrapLanguageModel } from "ai";
import { createLoggingMiddleware } from "./middleware/logging";
import { createCachingMiddleware } from "./middleware/caching";

/**
 * Wrap gateway models with middleware for logging and caching
 */
export function wrapGatewayModel(
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
      prefix: "[Gateway]",
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
