'use client';

import { useEffect, useState, useCallback } from "react";
import { useAvailableModels } from "@/lib/hooks/use-available-models";

export function useModelManager(initialModelId: string) {
  const { models, isLoading, error, providers } = useAvailableModels();
  const [currentModelId, setCurrentModelIdState] = useState(initialModelId);

  // Use useCallback to memoize the setter to prevent infinite loops
  const setCurrentModelId = useCallback((newModelId: string) => {
    setCurrentModelIdState(newModelId);
  }, []);

  useEffect(() => {
    setCurrentModelId(initialModelId);
  }, [initialModelId, setCurrentModelId]);

  useEffect(() => {
    if (!models.length) return;
    const hasCurrent = models.some((model) => model.id === currentModelId);
    if (!hasCurrent) {
      setCurrentModelId(models[0].id);
    }
  }, [models]); // Removed currentModelId from dependency array to prevent infinite loop

  return {
    models,
    modelsLoading: isLoading,
    modelsError: error,
    providers,
    currentModelId,
    setCurrentModelId,
  };
}
