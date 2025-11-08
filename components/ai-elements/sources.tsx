"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Context for managing the sources state
const SourcesContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

// Main container component
interface SourcesProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultOpen?: boolean;
}

const Sources = React.forwardRef<HTMLDivElement, SourcesProps>(
  ({ className, defaultOpen = false, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
      <SourcesContext.Provider value={{ isOpen, setIsOpen }}>
        <div
          ref={ref}
          className={cn("space-y-2 my-3", className)}
          {...props}
        >
          {children}
        </div>
      </SourcesContext.Provider>
    );
  }
);
Sources.displayName = "Sources";

// Trigger button component
interface SourcesTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  count?: number;
}

const SourcesTrigger = React.forwardRef<HTMLButtonElement, SourcesTriggerProps>(
  ({ className, count = 0, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SourcesContext);

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-7 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
          className
        )}
        {...props}
      >
        <FileText className="h-3.5 w-3.5" />
        <span>
          {count} {count === 1 ? "Source" : "Sources"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Button>
    );
  }
);
SourcesTrigger.displayName = "SourcesTrigger";

// Content container component
const SourcesContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(SourcesContext);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300",
        "rounded-lg border bg-muted/30 p-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SourcesContent.displayName = "SourcesContent";

// Individual source link component
interface SourceProps extends React.ComponentPropsWithoutRef<"a"> {
  href: string;
  title?: string;
}

const Source = React.forwardRef<HTMLAnchorElement, SourceProps>(
  ({ className, href, title, children, ...props }, ref) => {
    // Extract domain from URL for display
    const getDomain = (url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace("www.", "");
      } catch {
        return url;
      }
    };

    const domain = getDomain(href);
    const displayTitle = title || domain;

    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm",
          "bg-background hover:bg-accent transition-colors",
          "border hover:border-accent-foreground/20",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{children || displayTitle}</p>
            <p className="text-xs text-muted-foreground truncate">{domain}</p>
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </a>
    );
  }
);
Source.displayName = "Source";

export { Sources, SourcesTrigger, SourcesContent, Source };
