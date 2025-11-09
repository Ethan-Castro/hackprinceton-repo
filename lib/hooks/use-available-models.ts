import { useState, useEffect, useCallback } from "react";
import type { DisplayModel } from "@/lib/display-model";
import { SUPPORTED_MODELS, CEREBRAS_MODELS } from "@/lib/constants";

const MAX_RETRIES = 3;
const RETRY_DELAY_MILLIS = 5000;

function buildModelList(models: Array<{ id: string; name: string }>): DisplayModel[] {
  return models
    .filter((model) => SUPPORTED_MODELS.includes(model.id))
    .map((model) => ({
      id: model.id,
      label: model.name || model.id, // Fallback to ID if name is missing
    }))
    .sort((a, b) => {
      // Sort Cerebras models first, then gateway models
      const aIsCerebras = CEREBRAS_MODELS.includes(a.id);
      const bIsCerebras = CEREBRAS_MODELS.includes(b.id);
      if (aIsCerebras && !bIsCerebras) return -1;
      if (!aIsCerebras && bIsCerebras) return 1;
      return a.label.localeCompare(b.label);
    });
}

export function useAvailableModels() {
  const [models, setModels] = useState<DisplayModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [providers, setProviders] = useState<{ cerebras: boolean; gateway: boolean } | null>(null);

  const fetchModels = useCallback(
    async (isRetry: boolean = false) => {
      if (!isRetry) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await fetch("/api/models");
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        const newModels = buildModelList(data.models);
        setModels(newModels);
        setProviders(data.meta?.providers ?? null);
        setError(null);
        setRetryCount(0);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch models")
        );
        setProviders(null);
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [retryCount]
  );

  useEffect(() => {
    if (retryCount === 0) {
      fetchModels(false);
    } else if (retryCount > 0 && retryCount <= MAX_RETRIES) {
      const timerId = setTimeout(() => {
        fetchModels(true);
      }, RETRY_DELAY_MILLIS);
      return () => clearTimeout(timerId);
    }
  }, [retryCount, fetchModels]);

  return { models, isLoading, error, providers };
}
