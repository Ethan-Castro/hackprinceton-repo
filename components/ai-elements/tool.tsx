"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronDown, Wrench, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getToolDisplayName } from "@/lib/tool-display-names"
import type { ToolUIPart } from "ai"

// Context for managing the tool state
const ToolContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

// Helper to get status badge info
function getStatusInfo(state: ToolUIPart["state"]) {
  switch (state) {
    case "input-streaming":
      return {
        label: "Pending",
        variant: "secondary" as const,
        icon: Loader2,
        iconClass: "animate-spin",
      }
    case "input-available":
      return {
        label: "Running",
        variant: "default" as const,
        icon: Loader2,
        iconClass: "animate-spin",
      }
    case "output-available":
      return {
        label: "Completed",
        variant: "outline" as const,
        icon: CheckCircle2,
        iconClass: "text-green-500",
      }
    case "output-error":
      return {
        label: "Error",
        variant: "destructive" as const,
        icon: XCircle,
        iconClass: "text-destructive",
      }
  }
}

// Main Tool component
interface ToolProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  defaultOpen?: boolean
}

const Tool = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  ToolProps
>(({ className, defaultOpen, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false)

  // Auto-open when completed or error
  React.useEffect(() => {
    if (defaultOpen !== undefined) {
      setIsOpen(defaultOpen)
    }
  }, [defaultOpen])

  return (
    <ToolContext.Provider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        ref={ref}
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </ToolContext.Provider>
  )
})
Tool.displayName = "Tool"

// ToolHeader component
interface ToolHeaderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>, "type"> {
  type: ToolUIPart["type"]
  state: ToolUIPart["state"] 
}

const ToolHeader = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ToolHeaderProps
>(({ className, type, state, ...props }, ref) => {
  const { isOpen } = React.useContext(ToolContext)
  const toolName = getToolDisplayName(type)
  const statusInfo = getStatusInfo(state)
  const StatusIcon = statusInfo.icon

  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium truncate">{toolName}</span>
        <Badge variant={statusInfo.variant} className="shrink-0">
          <StatusIcon className={cn("h-3 w-3 mr-1", statusInfo.iconClass)} />
          {statusInfo.label}
        </Badge>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </CollapsiblePrimitive.Trigger>
  )
})
ToolHeader.displayName = "ToolHeader"

// ToolContent component
const ToolContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    >
      <div className="border-t px-4 py-4 space-y-4">{children}</div>
    </CollapsiblePrimitive.Content>
  )
})
ToolContent.displayName = "ToolContent"

// ToolInput component
interface ToolInputProps extends React.ComponentPropsWithoutRef<"div"> {
  input?: ToolUIPart["input"]
}

const ToolInput = React.forwardRef<HTMLDivElement, ToolInputProps>(
  ({ className, input, ...props }, ref) => {
    if (!input) {
      return null
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Input
          </span>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <pre className="text-xs overflow-x-auto">
            <code>{JSON.stringify(input, null, 2)}</code>
          </pre>
        </div>
      </div>
    )
  }
)
ToolInput.displayName = "ToolInput"

// ToolOutput component
interface ToolOutputProps extends React.ComponentPropsWithoutRef<"div"> {
  output?: React.ReactNode
  errorText?: ToolUIPart["errorText"]
}

const ToolOutput = React.forwardRef<HTMLDivElement, ToolOutputProps>(
  ({ className, output, errorText, ...props }, ref) => {
    // Don't render if there's no output or error
    if (!output && !errorText) {
      return null
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {errorText ? "Error" : "Output"}
          </span>
        </div>
        {errorText ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-xs text-destructive">{errorText}</p>
          </div>
        ) : (
          <div className="rounded-md bg-muted/50 p-3">
            {typeof output === "string" ? (
              <pre className="text-xs overflow-x-auto">
                <code>{output}</code>
              </pre>
            ) : (
              <div className="text-sm">{output}</div>
            )}
          </div>
        )}
      </div>
    )
  }
)
ToolOutput.displayName = "ToolOutput"

export { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput }

