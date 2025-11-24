"use client"

import * as React from "react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Main InlineCitation component
const InlineCitation = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("inline-flex items-baseline", className)}
      {...props}
    />
  )
})
InlineCitation.displayName = "InlineCitation"

// InlineCitationText component (for the citation number)
const InlineCitationText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-xs align-super text-primary", className)}
      {...props}
    >
      {children}
    </span>
  )
})
InlineCitationText.displayName = "InlineCitationText"

// InlineCitationCard component (HoverCard wrapper)
const InlineCitationCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof HoverCard>
>(({ ...props }, ref) => {
  return <div ref={ref}><HoverCard {...props} /></div>
})
InlineCitationCard.displayName = "InlineCitationCard"

// InlineCitationCardTrigger component
type InlineCitationCardTriggerProps = React.ComponentProps<"button"> & {
  sources: string[]
}

const InlineCitationCardTrigger = React.forwardRef<
  HTMLButtonElement,
  InlineCitationCardTriggerProps
>(({ sources, className, ...props }, ref) => {
  // Extract hostname from first source
  const getHostname = (url: string) => {
    try {
      const hostname = new URL(url).hostname
      return hostname.replace("www.", "")
    } catch {
      return "source"
    }
  }

  const hostname = sources.length > 0 ? getHostname(sources[0]) : "source"
  const count = sources.length

  return (
    <HoverCardTrigger asChild>
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 align-baseline mx-0.5",
          className
        )}
        {...props}
      >
        <Badge
          variant="secondary"
          className="h-5 px-1.5 text-xs font-normal cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          <span className="text-muted-foreground">{hostname}</span>
          {count > 1 && (
            <>
              <span className="mx-1 text-muted-foreground/50">·</span>
              <span className="font-medium">{count}</span>
            </>
          )}
        </Badge>
      </button>
    </HoverCardTrigger>
  )
})
InlineCitationCardTrigger.displayName = "InlineCitationCardTrigger"

// InlineCitationCardBody component
const InlineCitationCardBody = React.forwardRef<
  React.ElementRef<typeof HoverCardContent>,
  React.ComponentProps<typeof HoverCardContent>
>(({ className, ...props }, ref) => {
  return (
    <HoverCardContent
      ref={ref}
      className={cn("w-full max-w-[calc(100vw-2rem)] sm:w-96 p-0", className)}
      {...props}
    />
  )
})
InlineCitationCardBody.displayName = "InlineCitationCardBody"

// InlineCitationCarousel component
const InlineCitationCarousel = React.forwardRef<
  React.ElementRef<typeof Carousel>,
  React.ComponentProps<typeof Carousel>
>(({ className, ...props }, ref) => {
  return <Carousel ref={ref} className={cn("w-full", className)} {...props} />
})
InlineCitationCarousel.displayName = "InlineCitationCarousel"

// InlineCitationCarouselContent component
const InlineCitationCarouselContent = React.forwardRef<
  React.ElementRef<typeof CarouselContent>,
  React.ComponentProps<typeof CarouselContent>
>(({ className, ...props }, ref) => {
  return (
    <CarouselContent ref={ref} className={cn("", className)} {...props} />
  )
})
InlineCitationCarouselContent.displayName = "InlineCitationCarouselContent"

// InlineCitationCarouselItem component
const InlineCitationCarouselItem = React.forwardRef<
  React.ElementRef<typeof CarouselItem>,
  React.ComponentProps<typeof CarouselItem>
>(({ className, ...props }, ref) => {
  return (
    <CarouselItem
      ref={ref}
      className={cn("p-4 space-y-3", className)}
      {...props}
    />
  )
})
InlineCitationCarouselItem.displayName = "InlineCitationCarouselItem"

// InlineCitationCarouselHeader component
const InlineCitationCarouselHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 px-4 pt-4 pb-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
InlineCitationCarouselHeader.displayName = "InlineCitationCarouselHeader"

// InlineCitationCarouselIndex component
const InlineCitationCarouselIndex = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const carousel = useCarousel()
  const current = carousel.selectedIndex + 1
  const total = carousel.scrollSnaps.length

  if (children) {
    return (
      <div ref={ref} className={cn("flex-1 text-center", className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 text-center text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {current}/{total}
    </div>
  )
})
InlineCitationCarouselIndex.displayName = "InlineCitationCarouselIndex"

// InlineCitationCarouselPrev component
const InlineCitationCarouselPrev = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const carousel = useCarousel()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={carousel.scrollPrev}
      disabled={!carousel.canScrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous citation</span>
    </Button>
  )
})
InlineCitationCarouselPrev.displayName = "InlineCitationCarouselPrev"

// InlineCitationCarouselNext component
const InlineCitationCarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const carousel = useCarousel()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={carousel.scrollNext}
      disabled={!carousel.canScrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next citation</span>
    </Button>
  )
})
InlineCitationCarouselNext.displayName = "InlineCitationCarouselNext"

// InlineCitationSource component
type InlineCitationSourceProps = React.ComponentProps<"div"> & {
  title: string
  url: string
  description?: string
}

const InlineCitationSource = React.forwardRef<
  HTMLDivElement,
  InlineCitationSourceProps
>(({ title, url, description, className, ...props }, ref) => {
  const hostname = React.useMemo(() => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return url
    }
  }, [url])

  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      <div className="space-y-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline flex items-start gap-2 group"
        >
          <span className="flex-1 line-clamp-2">{title}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:underline block truncate"
        >
          {hostname}
        </a>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </div>
  )
})
InlineCitationSource.displayName = "InlineCitationSource"

// InlineCitationQuote component
const InlineCitationQuote = React.forwardRef<
  HTMLQuoteElement,
  React.ComponentProps<"blockquote">
>(({ className, ...props }, ref) => {
  return (
    <blockquote
      ref={ref}
      className={cn(
        "border-l-2 border-primary/50 pl-3 py-1 text-xs text-muted-foreground italic",
        className
      )}
      {...props}
    />
  )
})
InlineCitationQuote.displayName = "InlineCitationQuote"

export {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
}
