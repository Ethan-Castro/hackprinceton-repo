'use client';

import { useEffect, useState, useCallback, useRef } from "react";

export interface GenerationMetrics {
  // Timing
  latency: number | null;           // TTFT in ms
  generationTime: number | null;    // Total time in ms
  tokensPerSecond?: number | null;  // Throughput (computed when available)

  // Tokens
  tokensPrompt: number | null;
  tokensCompletion: number | null;
  tokensReasoning: number | null;

  // Metadata
  generationId: string | null;
  model: string | null;
  providerName: string | null;
  createdAt: string | null;

  // State
  isLoading: boolean;
  error: Error | null;
}

// AI Gateway response format
interface AIGatewayGenerationResponse {
  id: string;
  latency: number;
  generation_time: number;
  tokens_prompt: number;
  tokens_completion: number;
  native_tokens_reasoning?: number;
  model: string;
  provider_name: string;
  created_at: string;
}

const initialMetrics: GenerationMetrics = {
  latency: null,
  generationTime: null,
  tokensPrompt: null,
  tokensCompletion: null,
  tokensReasoning: null,
  tokensPerSecond: null,
  generationId: null,
  model: null,
  providerName: null,
  createdAt: null,
  isLoading: false,
  error: null,
};

// Hook to fetch generation metrics from AI Gateway
// Pass generationId to fetch metrics for a specific generation
export function useGenerationMetrics(
  generationId: string | null,
  metricsOverride?: Partial<GenerationMetrics> | null
): GenerationMetrics & { refetch: () => void } {
  const [metrics, setMetrics] = useState<GenerationMetrics>(initialMetrics);
  const lastFetchedId = useRef<string | null>(null);

  const fetchMetrics = useCallback(async (id: string) => {
    if (!id) return;

    setMetrics(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch from the AI Gateway proxy endpoint
      const response = await fetch(`/api/usage/generation?id=${encodeURIComponent(id)}`);

      if (!response.ok) {
        if (response.status === 404) {
          setMetrics(prev => ({ ...prev, isLoading: false }));
          return;
        }
        throw new Error(`Failed to fetch generation metrics: ${response.statusText}`);
      }

      const data: AIGatewayGenerationResponse = await response.json();

      lastFetchedId.current = id;
      setMetrics({
        latency: data.latency ?? null,
        generationTime: data.generation_time ?? null,
        tokensPrompt: data.tokens_prompt ?? null,
        tokensCompletion: data.tokens_completion ?? null,
        tokensReasoning: data.native_tokens_reasoning ?? null,
        generationId: data.id ?? null,
        model: data.model ?? null,
        providerName: data.provider_name ?? null,
        createdAt: data.created_at ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setMetrics(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
    }
  }, []);

  useEffect(() => {
    // If we were given an override (computed locally), use it directly
    if (metricsOverride) {
      setMetrics(prev => ({
        ...prev,
        ...metricsOverride,
        isLoading: false,
        error: null,
      }));
      return;
    }

    // Only fetch if we have a new generationId
    if (generationId && generationId !== lastFetchedId.current) {
      fetchMetrics(generationId);
    }
  }, [generationId, fetchMetrics, metricsOverride]);

  const refetch = useCallback(() => {
    if (generationId && !metricsOverride) {
      fetchMetrics(generationId);
    }
  }, [generationId, fetchMetrics, metricsOverride]);

  return { ...metrics, refetch };
}

// Helper to format milliseconds to human-readable time
export function formatMs(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Helper to format token count
export function formatTokens(count: number | null): string {
  if (count === null) return '-';
  return count.toLocaleString();
}

// Helper to format date
export function formatDate(isoString: string | null): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return '-';
  }
}
