'use client';

import * as React from 'react';
import { X, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const Artifact = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col rounded-lg border bg-card shadow-sm transition-all duration-200 ease-out',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Artifact.displayName = 'Artifact';

const ArtifactHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between gap-4 border-b px-4 py-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ArtifactHeader.displayName = 'ArtifactHeader';

const ArtifactTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </p>
  );
});
ArtifactTitle.displayName = 'ArtifactTitle';

const ArtifactDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
});
ArtifactDescription.displayName = 'ArtifactDescription';

const ArtifactActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {children}
    </div>
  );
});
ArtifactActions.displayName = 'ArtifactActions';

interface ArtifactActionProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  tooltip?: string;
  label: string;
  icon: LucideIcon;
}

const ArtifactAction = React.forwardRef<
  HTMLButtonElement,
  ArtifactActionProps
>(({ tooltip, label, icon: Icon, className, ...props }, ref) => {
  const button = (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 hover:scale-105 transition-transform duration-150', className)}
      aria-label={label}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});
ArtifactAction.displayName = 'ArtifactAction';

const ArtifactClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', className)}
      aria-label="Close"
      {...props}
    >
      <X className="h-4 w-4" />
    </Button>
  );
});
ArtifactClose.displayName = 'ArtifactClose';

const ArtifactContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
});
ArtifactContent.displayName = 'ArtifactContent';

export {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose,
  ArtifactContent,
};

