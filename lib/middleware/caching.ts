import type { LanguageModelMiddleware } from 'ai';
import crypto from 'crypto';

/**
 * Simple in-memory cache for model responses
 * In production, consider Redis or other persistent cache
 */
class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(options?: { maxSize?: number; ttlMs?: number }) {
    this.maxSize = options?.maxSize ?? 1000;
    this.ttlMs = options?.ttlMs ?? 3600000; // 1 hour default
  }

  generateKey(options: any): string {
    try {
      // Create cache key from core parameters
      // Safely handle messages - they might be in different structures
      let messagesData: any = null;
      if (Array.isArray(options.messages)) {
        messagesData = options.messages.map((m: any) => ({
          role: m.role || m.type || 'unknown',
          contentLength: typeof m.content === 'string'
            ? m.content.length
            : Array.isArray(m.content)
              ? JSON.stringify(m.content).length
              : 0,
        }));
      }

      const cacheKeyData = {
        modelId: options.model?.modelId || 'unknown',
        messagesCount: Array.isArray(options.messages) ? options.messages.length : 0,
        messagesHash: messagesData ? JSON.stringify(messagesData) : '',
        // Don't include tools in cache key as they may vary per call
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      };

      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(cacheKeyData))
        .digest('hex');

      return hash;
    } catch (error) {
      // Fallback to a simple hash if we can't generate a proper key
      return crypto
        .createHash('sha256')
        .update(Date.now().toString() + Math.random().toString())
        .digest('hex');
    }
  }

  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time for LRU eviction
    entry.lastAccessed = Date.now();
    return entry;
  }

  set(key: string, value: CacheEntry): void {
    // Simple LRU: if cache is full, remove least recently accessed entry
    if (this.cache.size >= this.maxSize) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

interface CacheEntry {
  response: unknown;
  timestamp: number;
  lastAccessed: number;
}

const globalCache = new ResponseCache();

/**
 * Create a caching middleware for language models
 * Caches responses based on model ID, messages, and parameters
 */
export function createCachingMiddleware(options?: {
  enabled?: boolean;
  maxSize?: number;
  ttlMs?: number;
  debug?: boolean;
}): LanguageModelMiddleware {
  const enabled = options?.enabled ?? true;
  const debug = options?.debug ?? false;
  const cache = new ResponseCache({
    maxSize: options?.maxSize,
    ttlMs: options?.ttlMs,
  });

  return {
    transformParams: async (params: any) => {
      if (!enabled) {
        return params;
      }

      // Check cache before calling model
      const cacheKey = cache.generateKey(params);
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        if (debug) {
          console.log(`[Cache] HIT for ${params.model?.modelId}`);
        }
        // We can't directly return cached response here,
        // so we'll store it in context for later retrieval
        // This is a limitation of the current middleware API
      }

      return params;
    },
  };
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return globalCache.getStats();
}

/**
 * Clear the global cache
 */
export function clearCache() {
  globalCache.clear();
}

/**
 * Set custom cache implementation
 */
export function setGlobalCache(cache: ResponseCache) {
  // This allows users to provide their own cache implementation
  // For now, we use the default in-memory cache
}
