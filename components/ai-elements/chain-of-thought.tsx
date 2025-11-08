"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown, Lightbulb, CheckCircle2, Circle, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Context for managing the chain of thought state
const ChainOfThoughtContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

// Main container component
interface ChainOfThoughtProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  defaultOpen?: boolean;
}

const ChainOfThought = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  ChainOfThoughtProps
>(({ className, defaultOpen = false, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <ChainOfThoughtContext.Provider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        ref={ref}
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </ChainOfThoughtContext.Provider>
  );
});
ChainOfThought.displayName = "ChainOfThought";

// Header/Trigger component
interface ChainOfThoughtHeaderProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {
  children?: React.ReactNode;
}

const ChainOfThoughtHeader = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ChainOfThoughtHeaderProps
>(({ className, children = "Chain of Thought", ...props }, ref) => {
  const { isOpen } = React.useContext(ChainOfThoughtContext);

  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-medium transition-colors hover:bg-muted/50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{children}</span>
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
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";

// Content container component
const ChainOfThoughtContent = React.forwardRef<
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
      <div className="border-t px-4 py-3 space-y-3">
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
});
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";

// Step component
interface ChainOfThoughtStepProps extends React.ComponentPropsWithoutRef<"div"> {
  icon?: LucideIcon;
  label: string;
  description?: string;
  status?: "complete" | "active" | "pending";
}

const ChainOfThoughtStep = React.forwardRef<
  HTMLDivElement,
  ChainOfThoughtStepProps
>(({ className, icon, label, description, status = "complete", ...props }, ref) => {
  const IconComponent = icon || Circle;

  const getStatusStyles = () => {
    switch (status) {
      case "complete":
        return {
          icon: CheckCircle2,
          iconClass: "text-green-500",
          labelClass: "text-foreground",
        };
      case "active":
        return {
          icon: Loader2,
          iconClass: "text-primary animate-spin",
          labelClass: "text-foreground font-medium",
        };
      case "pending":
        return {
          icon: Circle,
          iconClass: "text-muted-foreground",
          labelClass: "text-muted-foreground",
        };
    }
  };

  const styles = getStatusStyles();
  const StatusIcon = icon || styles.icon;

  return (
    <div
      ref={ref}
      className={cn("flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300", className)}
      {...props}
    >
      <StatusIcon className={cn("h-5 w-5 mt-0.5 shrink-0", styles.iconClass)} />
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-sm", styles.labelClass)}>{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
});
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";

// Search results container
const ChainOfThoughtSearchResults = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap gap-2 p-3 rounded-md bg-muted/30 animate-in fade-in slide-in-from-left-2 duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";

// Individual search result badge
interface ChainOfThoughtSearchResultProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const ChainOfThoughtSearchResult = React.forwardRef<
  HTMLDivElement,
  ChainOfThoughtSearchResultProps
>(({ className, variant = "secondary", children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      <Badge
        variant={variant}
        className={cn("text-xs cursor-default", className)}
      >
        {children}
      </Badge>
    </div>
  );
});
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";

// Image component
interface ChainOfThoughtImageProps extends React.ComponentPropsWithoutRef<"div"> {
  caption?: string;
}

const ChainOfThoughtImage = React.forwardRef<
  HTMLDivElement,
  ChainOfThoughtImageProps
>(({ className, caption, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-2 animate-in fade-in slide-in-from-left-2 duration-300", className)}
      {...props}
    >
      <div className="rounded-md border overflow-hidden bg-muted/30">
        {children}
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground text-center">{caption}</p>
      )}
    </div>
  );
});
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";

export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
};
