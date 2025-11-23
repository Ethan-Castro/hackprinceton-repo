"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ReasoningContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isStreaming: boolean;
  duration?: number;
}>({
  isOpen: false,
  setIsOpen: () => {},
  isStreaming: false,
  duration: undefined,
});

interface ReasoningProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  isStreaming?: boolean;
  duration?: number;
}

const Reasoning = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  ReasoningProps
>(({ className, isStreaming = false, duration, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Auto-open when streaming, auto-close when finished
  React.useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    } else if (!isStreaming && isOpen) {
      // Add a delay before closing to allow reading (1000ms per AI SDK spec)
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isOpen]);

  return (
    <ReasoningContext.Provider value={{ isOpen, setIsOpen, isStreaming, duration }}>
      <CollapsiblePrimitive.Root
        ref={ref}
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("border rounded-lg transition-all duration-200 ease-out", className)}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </ReasoningContext.Provider>
  );
});
Reasoning.displayName = "Reasoning";

interface ReasoningTriggerProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {
  title?: string;
}

const ReasoningTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ReasoningTriggerProps
>(({ className, title = "Reasoning", ...props }, ref) => {
  const { isOpen, isStreaming, duration } = React.useContext(ReasoningContext);

  // Format duration to "Took Xs" or "Took Xms" for very quick responses
  const durationDisplay =
    !isStreaming && duration
      ? duration >= 1000
        ? `Took ${(duration / 1000).toFixed(1)}s`
        : `Took ${Math.round(duration)}ms`
      : null;

  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-150 ease-out hover:bg-muted/50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span>{durationDisplay || title}</span>
        {isStreaming && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </CollapsiblePrimitive.Trigger>
  );
});
ReasoningTrigger.displayName = "ReasoningTrigger";

const ReasoningContent = React.forwardRef<
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
      <div className="px-4 py-3 text-sm border-t">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {typeof children === "string" ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {children}
            </ReactMarkdown>
          ) : (
            children
          )}
        </div>
      </div>
    </CollapsiblePrimitive.Content>
  );
});
ReasoningContent.displayName = "ReasoningContent";

export { Reasoning, ReasoningTrigger, ReasoningContent };

