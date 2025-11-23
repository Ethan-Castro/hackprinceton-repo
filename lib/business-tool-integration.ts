/**
 * Business Tool Integration with Error Handling and Retry Logic
 * Demonstrates how to use the tool executor utilities with business tools
 */

import type { LanguageModel } from 'ai';
import {
  generateBusinessPlanStructured,
  generateFinancialProjectionsStructured,
  generateMarketAnalysisStructured,
  generateCompetitorAnalysisStructured,
  type BusinessAnalysisRequest,
} from './business-generators';
import {
  executeToolWithRetry,
  executeToolWithFallback,
  executeToolsInParallel,
  executeToolWithTimeout,
  CircuitBreakerToolExecutor,
} from './tool-executor';

// ============================================================================
// Business Analysis with Error Handling
// ============================================================================

export interface SafeBusinessAnalysisOptions {
  retryAttempts?: number;
  timeoutMs?: number;
  useFallback?: boolean;
  useCircuitBreaker?: boolean;
}

/**
 * Generate business plan with robust error handling
 */
export async function generateBusinessPlanSafe(
  model: LanguageModel,
  context: {
    companyName: string;
    businessDescription: string;
    targetMarket?: string;
  },
  options?: SafeBusinessAnalysisOptions
) {
  const executor = () => generateBusinessPlanStructured(model, context);

  const retryOptions = {
    maxAttempts: options?.retryAttempts ?? 3,
  };

  const result = await executeToolWithRetry(
    'generateBusinessPlan',
    () => executeToolWithTimeout(executor, options?.timeoutMs ?? 60000),
    retryOptions
  );

  if (!result.success) {
    throw new Error(`Failed to generate business plan: ${result.error?.message}`);
  }

  return result.data!.object;
}

/**
 * Generate financial projections with robust error handling
 */
export async function generateFinancialProjectionsSafe(
  model: LanguageModel,
  context: {
    businessType: string;
    timeframe: '3 Years' | '5 Years' | '10 Years';
    startingCapital?: number;
    targetRevenue?: number;
  },
  options?: SafeBusinessAnalysisOptions
) {
  const executor = () => generateFinancialProjectionsStructured(model, context);

  const retryOptions = {
    maxAttempts: options?.retryAttempts ?? 3,
  };

  const result = await executeToolWithRetry(
    'generateFinancialProjections',
    () => executeToolWithTimeout(executor, options?.timeoutMs ?? 60000),
    retryOptions
  );

  if (!result.success) {
    throw new Error(`Failed to generate financial projections: ${result.error?.message}`);
  }

  return result.data!.object;
}

/**
 * Generate market analysis with robust error handling
 */
export async function generateMarketAnalysisSafe(
  model: LanguageModel,
  context: {
    industry: string;
    productOrService: string;
    targetGeography?: string;
  },
  options?: SafeBusinessAnalysisOptions
) {
  const executor = () => generateMarketAnalysisStructured(model, context);

  const retryOptions = {
    maxAttempts: options?.retryAttempts ?? 3,
  };

  const result = await executeToolWithRetry(
    'generateMarketAnalysis',
    () => executeToolWithTimeout(executor, options?.timeoutMs ?? 60000),
    retryOptions
  );

  if (!result.success) {
    throw new Error(`Failed to generate market analysis: ${result.error?.message}`);
  }

  return result.data!.object;
}

/**
 * Generate competitor analysis with robust error handling
 */
export async function generateCompetitorAnalysisSafe(
  model: LanguageModel,
  context: {
    company: string;
    industry: string;
    mainCompetitors?: string[];
  },
  options?: SafeBusinessAnalysisOptions
) {
  const executor = () => generateCompetitorAnalysisStructured(model, context);

  const retryOptions = {
    maxAttempts: options?.retryAttempts ?? 3,
  };

  const result = await executeToolWithRetry(
    'generateCompetitorAnalysis',
    () => executeToolWithTimeout(executor, options?.timeoutMs ?? 60000),
    retryOptions
  );

  if (!result.success) {
    throw new Error(`Failed to generate competitor analysis: ${result.error?.message}`);
  }

  return result.data!.object;
}

/**
 * Generate all business analyses in parallel with error isolation
 */
export async function generateAllBusinessAnalysesSafe(
  model: LanguageModel,
  requests: BusinessAnalysisRequest,
  options?: SafeBusinessAnalysisOptions
) {
  const tools: any = {};

  if (requests.businessPlan) {
    tools.businessPlan = {
      executor: () => generateBusinessPlanStructured(model, requests.businessPlan!),
      options: { maxAttempts: options?.retryAttempts ?? 3 },
    };
  }

  if (requests.financialProjections) {
    tools.financialProjections = {
      executor: () =>
        generateFinancialProjectionsStructured(model, requests.financialProjections!),
      options: { maxAttempts: options?.retryAttempts ?? 3 },
    };
  }

  if (requests.marketAnalysis) {
    tools.marketAnalysis = {
      executor: () =>
        generateMarketAnalysisStructured(model, requests.marketAnalysis!),
      options: { maxAttempts: options?.retryAttempts ?? 3 },
    };
  }

  if (requests.competitorAnalysis) {
    tools.competitorAnalysis = {
      executor: () =>
        generateCompetitorAnalysisStructured(model, requests.competitorAnalysis!),
      options: { maxAttempts: options?.retryAttempts ?? 3 },
    };
  }

  // Execute all in parallel with error isolation
  const results = await executeToolsInParallel(tools);

  return {
    success: results.partialSuccess,
    data: results.results,
    errors: results.errors,
    errorCount: Object.keys(results.errors).length,
  };
}

/**
 * Create a circuit breaker executor for a specific business tool
 * Useful for protecting against cascading failures
 */
export function createBusinessToolCircuitBreaker(
  failureThreshold: number = 5,
  resetTimeoutMs: number = 60000
) {
  return new CircuitBreakerToolExecutor(failureThreshold, resetTimeoutMs);
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example: Generate business plan with automatic retry
 */
export async function exampleBusinessPlanGeneration(model: LanguageModel) {
  try {
    const plan = await generateBusinessPlanSafe(
      model,
      {
        companyName: 'TechStartup Inc',
        businessDescription: 'An AI-powered automation platform',
        targetMarket: 'Enterprise SaaS',
      },
      {
        retryAttempts: 3,
        timeoutMs: 60000,
      }
    );

    console.log('Business Plan Generated:', plan.companyName);
    return plan;
  } catch (error: any) {
    console.error('Failed to generate business plan:', error.message);
    throw error;
  }
}

/**
 * Example: Generate multiple analyses in parallel
 */
export async function exampleParallelAnalysis(model: LanguageModel) {
  try {
    const result = await generateAllBusinessAnalysesSafe(
      model,
      {
        businessPlan: {
          companyName: 'TechStartup Inc',
          businessDescription: 'An AI-powered automation platform',
          targetMarket: 'Enterprise SaaS',
        },
        financialProjections: {
          businessType: 'B2B SaaS',
          timeframe: '5 Years',
          targetRevenue: 10000000,
        },
        marketAnalysis: {
          industry: 'Enterprise Automation',
          productOrService: 'AI Automation Platform',
          targetGeography: 'North America',
        },
      },
      {
        retryAttempts: 2,
        timeoutMs: 90000,
      }
    );

    if (result.success) {
      console.log('Analyses Generated:', Object.keys(result.data).join(', '));
    } else {
      console.warn('Some analyses failed:', Object.keys(result.errors).join(', '));
    }

    return result;
  } catch (error: any) {
    console.error('Failed to generate analyses:', error.message);
    throw error;
  }
}
