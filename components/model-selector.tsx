"use client";

import { Loader2, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { memo } from "react";
import type { DisplayModel } from "@/lib/display-model";

type ModelSelectorProps = {
  modelId: string;
  onModelChange: (modelId: string) => void;
  models: DisplayModel[];
  isLoading: boolean;
  error: Error | null;
};

export const ModelSelector = memo(function ModelSelector({
  modelId,
  onModelChange,
  models,
  isLoading,
  error,
}: ModelSelectorProps) {

  return (
    <Select
      value={modelId}
      onValueChange={onModelChange}
      disabled={isLoading || !!error || !models?.length}
    >
      <SelectTrigger className="w-9 h-9 md:min-w-[200px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:outline-none focus:border-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl font-serif italic text-sm p-0 md:px-3 [&_[data-placeholder]]:hidden md:[&_[data-placeholder]]:block [&>svg]:hidden md:[&>svg]:block text-muted-foreground hover:text-foreground transition-colors">
        <div className="flex items-center justify-center w-full h-full md:hidden">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        <div className="hidden md:flex items-center gap-2 w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-sm not-italic font-sans">Loading</span>
            </>
          ) : error ? (
            <span className="text-red-500 text-sm not-italic font-sans">Error</span>
          ) : !models?.length ? (
            <span className="text-sm not-italic font-sans">No models</span>
          ) : (
            <SelectValue placeholder="Select model" />
          )}
        </div>
      </SelectTrigger>

      <SelectContent className="rounded-2xl border-0 shadow-border-medium bg-popover/95 backdrop-blur-sm animate-scale-in" align="start" sideOffset={4}>
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground px-2 py-1 transition-colors duration-150 font-sans not-italic">Models</SelectLabel>
          {models?.map((model) => (
            <SelectItem key={model.id} value={model.id} className="rounded-lg hover:bg-accent/50 cursor-pointer font-serif italic text-muted-foreground focus:text-foreground focus:bg-accent/50">
              {model.label}
            </SelectItem>
          )) || []}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
