'use client';

import { useEffect, useState } from "react";
import { useAvailableModels } from "@/lib/hooks/use-available-models";

export function useModelManager(initialModelId: string) {
  const { models, isLoading, error, providers } = useAvailableModels();
  const [currentModelId, setCurrentModelId] = useState(initialModelId);

  useEffect(() => {
    setCurrentModelId(initialModelId);
  }, [initialModelId]);

  useEffect(() => {
    if (!models.length) return;
    const hasCurrent = models.some((model) => model.id === currentModelId);
    if (!hasCurrent) {
      setCurrentModelId(models[0].id);
    }
  }, [models, currentModelId]);

  return {
    models,
    modelsLoading: isLoading,
    modelsError: error,
    providers,
    currentModelId,
    setCurrentModelId,
  };
}
