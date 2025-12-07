"use client";

import * as React from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Timer, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGenerationMetrics,
  formatMs,
  formatTokens,
  formatDate,
  type GenerationMetrics as GenerationMetricsType,
} from "@/lib/hooks/use-generation-metrics";

interface GenerationMetricsProps {
  generationId: string | null; // The generation ID to fetch metrics for
  metricsOverride?: Partial<GenerationMetricsType> | null;
  className?: string;
}

// Helper row component for displaying metrics
function MetricRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between text-xs", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// Section header component
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

export function GenerationMetrics({
  generationId,
  metricsOverride = null,
  className,
}: GenerationMetricsProps) {
  const metrics = useGenerationMetrics(generationId, metricsOverride);

  const hasData = metrics.latency !== null || metrics.generationTime !== null;

  // Show a waiting state if no data yet
  if (!generationId || (!hasData && !metrics.isLoading)) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-xs font-medium gap-1.5 text-muted-foreground",
              className
            )}
            onClick={(e) => e.preventDefault()}
          >
            <Timer className="h-3 w-3" />
            <span>Awaiting response...</span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="text-sm text-muted-foreground">
            Send a message to see generation metrics.
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Calculate streaming duration
  const streamingDuration =
    metrics.generationTime !== null && metrics.latency !== null
      ? metrics.generationTime - metrics.latency
      : null;

  // Use streaming duration (first→last token) for throughput when available; fall back to total
  const effectiveDuration =
    streamingDuration !== null && streamingDuration > 0
      ? streamingDuration
      : metrics.generationTime ?? null;

  const tokensPerSecond =
    metrics.tokensCompletion != null &&
    effectiveDuration !== null &&
    effectiveDuration > 0
      ? Number((metrics.tokensCompletion / (effectiveDuration / 1000)).toFixed(2))
      : metrics.tokensPerSecond ?? null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 text-xs font-medium gap-1.5",
            className
          )}
          disabled={metrics.isLoading && !hasData}
          onClick={(e) => e.preventDefault()}
        >
          {metrics.isLoading && !hasData ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </>
          ) : hasData ? (
            <>
              <Timer className="h-3 w-3" />
              <span>
                {formatMs(metrics.latency)} TTFT
                {metrics.generationTime && ` | ${formatMs(metrics.generationTime)}`}
              </span>
            </>
          ) : (
            <>
              <Timer className="h-3 w-3" />
              <span>No metrics</span>
            </>
          )}
        </Button>
      </HoverCardTrigger>

      <HoverCardContent className="w-80">
        {metrics.error ? (
          <div className="text-sm text-destructive">
            Failed to load metrics: {metrics.error.message}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timing Section */}
            <div>
              <SectionHeader>Timing</SectionHeader>
              <div className="space-y-1.5">
                <MetricRow
                  label="Time to First Token"
                  value={formatMs(metrics.latency)}
                />
                <MetricRow
                  label="Total Generation Time"
                  value={formatMs(metrics.generationTime)}
                />
                <MetricRow
                  label="Streaming Duration"
                  value={formatMs(streamingDuration)}
                />
                <MetricRow
                  label="Tokens per Second"
                  value={tokensPerSecond != null ? tokensPerSecond.toLocaleString() : '-'}
                />
              </div>
            </div>

            {/* Tokens Section */}
            <div>
              <SectionHeader>Tokens</SectionHeader>
              <div className="space-y-1.5">
                <MetricRow
                  label="Prompt Tokens"
                  value={formatTokens(metrics.tokensPrompt)}
                />
                <MetricRow
                  label="Completion Tokens"
                  value={formatTokens(metrics.tokensCompletion)}
                />
                {metrics.tokensReasoning !== null && metrics.tokensReasoning > 0 && (
                  <MetricRow
                    label="Reasoning Tokens"
                    value={formatTokens(metrics.tokensReasoning)}
                  />
                )}
              </div>
            </div>

            {/* Generation Info Section */}
            <div className="pt-3 border-t">
              <SectionHeader>Generation Info</SectionHeader>
              <div className="space-y-1.5">
                <MetricRow
                  label="Model"
                  value={
                    <span className="truncate max-w-[180px] inline-block" title={metrics.model || '-'}>
                      {metrics.model || '-'}
                    </span>
                  }
                />
                <MetricRow
                  label="Provider"
                  value={metrics.providerName || '-'}
                />
                <MetricRow
                  label="Created"
                  value={formatDate(metrics.createdAt)}
                />
              </div>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

// Toggle button component for enabling/disabling metrics display
interface MetricsToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

export function MetricsToggle({
  enabled,
  onToggle,
  className,
}: MetricsToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "h-9 w-9 shadow-border-small hover:shadow-border-medium bg-background/80 backdrop-blur-sm border-0 hover:bg-background hover:scale-[1.02] transition-all duration-150 ease",
        enabled && "bg-primary/10 text-primary",
        className
      )}
      title={enabled ? "Hide generation metrics" : "Show generation metrics"}
    >
      <Timer className="h-4 w-4" />
    </Button>
  );
}
