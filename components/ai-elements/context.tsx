"use client"

import * as React from "react"
import { createContext, useContext } from "react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LanguageModelUsage } from "ai"

// Fallback type since tokenlens import is not working
type ModelId = string

// Fallback calculateCost function
// TODO: Update this when tokenlens export is fixed
function calculateCost(_params: any): number {
  return 0 // Return 0 cost as fallback
}

type ContextValue = {
  maxTokens: number
  usedTokens: number
  usage?: LanguageModelUsage
  modelId?: ModelId
}

const ContextContext = createContext<ContextValue | null>(null)

function useContextValue() {
  const context = useContext(ContextContext)
  if (!context) {
    throw new Error("Context components must be used within <Context>")
  }
  return context
}

// Helper function to format large numbers
function formatTokenCount(count: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count)
}

// Helper function to format cost
function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(cost)
}

// Main Context component
type ContextProps = React.ComponentProps<typeof HoverCard> & {
  maxTokens: number
  usedTokens: number
  usage?: LanguageModelUsage
  modelId?: ModelId
}

const Context = ({ maxTokens, usedTokens, usage, modelId, children, ...props }: ContextProps) => {
  return (
    <ContextContext.Provider value={{ maxTokens, usedTokens, usage, modelId }}>
      <HoverCard {...props}>
        {children}
      </HoverCard>
    </ContextContext.Provider>
  )
}
Context.displayName = "Context"

// Trigger component
type ContextTriggerProps = Omit<React.ComponentProps<typeof Button>, "children"> & {
  children?: React.ReactNode
}

const ContextTrigger = React.forwardRef<
  HTMLButtonElement,
  ContextTriggerProps
>(({ children, className, variant = "ghost", size = "sm", ...props }, ref) => {
  const { maxTokens, usedTokens } = useContextValue()
  const percentage = Math.round((usedTokens / maxTokens) * 100)

  if (children) {
    return (
      <HoverCardTrigger asChild>
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={className}
          {...props}
        >
          {children}
        </Button>
      </HoverCardTrigger>
    )
  }

  return (
    <HoverCardTrigger asChild>
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        {...props}
      >
        <span className="text-xs">{percentage}%</span>
        <BarChart3 className="h-4 w-4" />
      </Button>
    </HoverCardTrigger>
  )
})
ContextTrigger.displayName = "ContextTrigger"

// Content component
const ContextContent = React.forwardRef<
  React.ElementRef<typeof HoverCardContent>,
  React.ComponentProps<typeof HoverCardContent>
>(({ className, ...props }, ref) => {
  return (
    <HoverCardContent
      ref={ref}
      className={cn("w-80", className)}
      {...props}
    />
  )
})
ContextContent.displayName = "ContextContent"

// Content Header component
type ContextContentHeaderProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode
}

const ContextContentHeader = React.forwardRef<
  HTMLDivElement,
  ContextContentHeaderProps
>(({ children, className, ...props }, ref) => {
  const { maxTokens, usedTokens } = useContextValue()
  const percentage = Math.round((usedTokens / maxTokens) * 100)

  if (children) {
    return (
      <div ref={ref} className={cn("mb-4", className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("mb-4", className)} {...props}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">{percentage}%</span>
        <span className="text-xs text-muted-foreground">
          {formatTokenCount(usedTokens)} / {formatTokenCount(maxTokens)}
        </span>
      </div>
      <div className="relative h-2">
        <Progress value={percentage} className="h-2" />
        <svg
          className="absolute inset-0 w-full h-2"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${percentage * 2.51} 251`}
            transform="rotate(-90 50 50)"
            className="text-primary"
          />
        </svg>
      </div>
    </div>
  )
})
ContextContentHeader.displayName = "ContextContentHeader"

// Content Body component
const ContextContentBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
})
ContextContentBody.displayName = "ContextContentBody"

// Usage row component (internal)
type UsageRowProps = {
  label: string
  tokens?: number
  cost?: number
  className?: string
}

const UsageRow = React.forwardRef<HTMLDivElement, UsageRowProps>(
  ({ label, tokens, cost, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between text-xs", className)}
        {...props}
      >
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {tokens !== undefined && (
            <span className="font-medium">{formatTokenCount(tokens)}</span>
          )}
          {cost !== undefined && cost > 0 && (
            <span className="text-muted-foreground">{formatCost(cost)}</span>
          )}
        </div>
      </div>
    )
  }
)
UsageRow.displayName = "UsageRow"

// Individual usage components
type UsageComponentProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode
}

const ContextInputUsage = React.forwardRef<HTMLDivElement, UsageComponentProps>(
  ({ children, className, ...props }, ref) => {
    const { usage, modelId } = useContextValue()
    const tokens = (usage as any)?.promptTokens ?? 0

    if (children) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      )
    }

    const cost =
      modelId && tokens > 0
        ? calculateCost({ model: modelId, usage: { input: tokens } })
        : 0

    return (
      <UsageRow
        ref={ref}
        label="Input"
        tokens={tokens}
        cost={cost}
        className={className}
        {...props}
      />
    )
  }
)
ContextInputUsage.displayName = "ContextInputUsage"

const ContextOutputUsage = React.forwardRef<HTMLDivElement, UsageComponentProps>(
  ({ children, className, ...props }, ref) => {
    const { usage, modelId } = useContextValue()
    const tokens = (usage as any)?.completionTokens ?? 0

    if (children) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      )
    }

    const cost =
      modelId && tokens > 0
        ? calculateCost({ model: modelId, usage: { output: tokens } })
        : 0

    return (
      <UsageRow
        ref={ref}
        label="Output"
        tokens={tokens}
        cost={cost}
        className={className}
        {...props}
      />
    )
  }
)
ContextOutputUsage.displayName = "ContextOutputUsage"

const ContextReasoningUsage = React.forwardRef<
  HTMLDivElement,
  UsageComponentProps
>(({ children, className, ...props }, ref) => {
  const { usage, modelId } = useContextValue()
  const tokens =
    ((usage as any)?.experimental_completionTokensDetails as any)?.reasoningTokens ?? 0

  if (tokens === 0) {
    return null
  }

  if (children) {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }

  const cost =
    modelId && tokens > 0
      ? calculateCost({
          model: modelId,
          usage: { output: tokens },
        })
      : 0

  return (
    <UsageRow
      ref={ref}
      label="Reasoning"
      tokens={tokens}
      cost={cost}
      className={className}
      {...props}
    />
  )
})
ContextReasoningUsage.displayName = "ContextReasoningUsage"

const ContextCacheUsage = React.forwardRef<HTMLDivElement, UsageComponentProps>(
  ({ children, className, ...props }, ref) => {
    const { usage, modelId } = useContextValue()
    const tokens =
      ((usage as any)?.experimental_promptTokensDetails as any)?.cachedTokens ?? 0

    if (tokens === 0) {
      return null
    }

    if (children) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      )
    }

    const cost =
      modelId && tokens > 0
        ? calculateCost({
            model: modelId,
            usage: { cache_read: tokens },
          })
        : 0

    return (
      <UsageRow
        ref={ref}
        label="Cache"
        tokens={tokens}
        cost={cost}
        className={className}
        {...props}
      />
    )
  }
)
ContextCacheUsage.displayName = "ContextCacheUsage"

// Content Footer component
const ContextContentFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ children, className, ...props }, ref) => {
  const { usage, modelId } = useContextValue()

  if (children) {
    return (
      <div
        ref={ref}
        className={cn(
          "mt-4 pt-4 border-t bg-muted/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (!modelId || !usage) {
    return null
  }

  const totalCost = calculateCost({
    model: modelId,
    usage: {
      input: (usage as any).promptTokens ?? 0,
      output: (usage as any).completionTokens ?? 0,
      cache_read:
        ((usage as any).experimental_promptTokensDetails as any)?.cachedTokens ?? 0,
    },
  })

  return (
    <div
      ref={ref}
      className={cn(
        "mt-4 pt-4 border-t bg-muted/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg flex items-center justify-between text-xs",
        className
      )}
      {...props}
    >
      <span className="font-medium">Total Cost</span>
      <span className="font-bold">{formatCost(totalCost)}</span>
    </div>
  )
})
ContextContentFooter.displayName = "ContextContentFooter"

export {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
}

