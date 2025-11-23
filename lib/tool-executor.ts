/**
 * Tool Execution Utility
 * Provides robust tool execution with error handling, retry logic, and fallback strategies
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export interface ToolExecutionContext {
  toolName: string;
  input: any;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: Error | null;
  attempt?: number;
}

export interface ToolExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  context: ToolExecutionContext;
  fallbackUsed?: boolean;
}

/**
 * Default retry strategy
 * Retries on temporary errors (timeouts, rate limits, transient failures)
 */
function isRetryableError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code?.toLowerCase() || '';

  // Network and temporary errors
  if (
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('temporarily unavailable') ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT'
  ) {
    return true;
  }

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('too many requests')
  ) {
    return true;
  }

  // Transient API errors
  if (
    message.includes('503') ||
    message.includes('502') ||
    message.includes('504') ||
    message.includes('service unavailable') ||
    message.includes('bad gateway')
  ) {
    return true;
  }

  return false;
}

/**
 * Execute a tool with retry logic and error handling
 */
export async function executeToolWithRetry<T>(
  toolName: string,
  executor: () => Promise<T>,
  options?: RetryOptions
): Promise<ToolExecutionResult<T>> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const initialDelayMs = options?.delayMs ?? 100;
  const backoffMultiplier = options?.backoffMultiplier ?? 2;
  const shouldRetry = options?.shouldRetry ?? isRetryableError;

  let lastError: Error | null = null;
  let attempt = 0;

  const context: ToolExecutionContext = {
    toolName,
    input: {},
  };

  for (attempt = 1; attempt <= maxAttempts; attempt++) {
    context.startTime = Date.now();
    context.attempt = attempt;

    try {
      const result = await executor();
      context.endTime = Date.now();
      context.duration = context.endTime - context.startTime;

      return {
        success: true,
        data: result,
        context,
      };
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      context.error = lastError;
      context.endTime = Date.now();
      context.duration = context.endTime - context.startTime;

      // Check if we should retry
      if (attempt < maxAttempts && shouldRetry(error, attempt)) {
        const delayMs = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
        console.warn(
          `[Tool Executor] ${toolName} attempt ${attempt} failed. ` +
          `Retrying in ${delayMs}ms...`,
          { error: error.message }
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        // Don't retry or max attempts reached
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error(`${toolName} failed after ${maxAttempts} attempts`),
    context,
  };
}

/**
 * Execute a tool with fallback
 */
export async function executeToolWithFallback<T>(
  toolName: string,
  primary: () => Promise<T>,
  fallback?: () => Promise<T> | T,
  options?: RetryOptions
): Promise<ToolExecutionResult<T>> {
  // Try primary executor with retry logic
  const result = await executeToolWithRetry(toolName, primary, options);

  if (result.success) {
    return result;
  }

  // Try fallback if primary failed
  if (fallback) {
    try {
      console.log(`[Tool Executor] ${toolName} using fallback...`);
      const fallbackData = await Promise.resolve(fallback());
      return {
        success: true,
        data: fallbackData,
        context: result.context,
        fallbackUsed: true,
      };
    } catch (fallbackError) {
      console.error(
        `[Tool Executor] ${toolName} fallback also failed:`,
        fallbackError
      );
      return result; // Return original error
    }
  }

  return result;
}

/**
 * Execute multiple tools in parallel with error isolation
 * If one tool fails, others continue (fail-safe parallel execution)
 */
export async function executeToolsInParallel<T extends Record<string, any>>(
  tools: {
    [K in keyof T]: {
      executor: () => Promise<T[K]>;
      fallback?: () => Promise<T[K]> | T[K];
      options?: RetryOptions;
    };
  }
): Promise<{
  results: Partial<T>;
  errors: Record<string, Error>;
  partialSuccess: boolean;
}> {
  const results: Partial<T> = {};
  const errors: Record<string, Error> = {};

  const promises = Object.entries(tools).map(async ([key, { executor, fallback, options }]) => {
    const result = await executeToolWithFallback(
      key,
      executor,
      fallback,
      options
    );

    if (result.success && result.data !== undefined) {
      (results as any)[key] = result.data;
    } else if (result.error) {
      errors[key] = result.error;
    }
  });

  await Promise.all(promises);

  return {
    results,
    errors,
    partialSuccess: Object.keys(results).length > 0,
  };
}

/**
 * Timeout wrapper for tool execution
 */
export function executeToolWithTimeout<T>(
  executor: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    executor(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Tool execution timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Create a rate-limited tool executor
 */
export class RateLimitedToolExecutor {
  private queue: Array<{
    executor: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private executing = false;
  private lastExecutionTime = 0;

  constructor(
    private minDelayMs: number = 100,
    private concurrency: number = 1
  ) {}

  async execute<T>(toolName: string, executor: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        executor: async () => {
          try {
            const result = await executeToolWithRetry(toolName, executor);
            if (result.success && result.data !== undefined) {
              resolve(result.data);
            } else {
              reject(result.error || new Error('Tool execution failed'));
            }
          } catch (error) {
            reject(error);
          }
        },
        resolve,
        reject,
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.executing || this.queue.length === 0) {
      return;
    }

    this.executing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastExecution = now - this.lastExecutionTime;

      // Enforce minimum delay between executions
      if (timeSinceLastExecution < this.minDelayMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.minDelayMs - timeSinceLastExecution)
        );
      }

      const { executor, resolve, reject } = this.queue.shift()!;

      try {
        const result = await executor();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      this.lastExecutionTime = Date.now();
    }

    this.executing = false;
  }
}

/**
 * Circuit breaker pattern for tool execution
 * Prevents cascading failures by temporarily disabling failing tools
 */
export class CircuitBreakerToolExecutor {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000
  ) {}

  async execute<T>(
    toolName: string,
    executor: () => Promise<T>
  ): Promise<T> {
    // Check circuit state
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error(
          `[Circuit Breaker] ${toolName} is currently unavailable ` +
          `(${Math.ceil((this.resetTimeoutMs - timeSinceLastFailure) / 1000)}s remaining)`
        );
      }
    }

    try {
      const result = await executeToolWithRetry(toolName, executor);

      if (result.success) {
        // Success: reset failure count
        this.failureCount = 0;
        this.state = 'closed';
        return result.data!;
      } else {
        throw result.error;
      }
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
        console.error(
          `[Circuit Breaker] ${toolName} opened after ${this.failureCount} failures`
        );
      }

      throw error;
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
    };
  }
}
