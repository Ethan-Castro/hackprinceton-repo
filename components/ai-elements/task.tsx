'use client';

import React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { CheckCircle2, Circle, Loader2, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TaskProps
  extends Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, 'children'> {
  status?: 'pending' | 'in_progress' | 'completed' | 'error';
  className?: string;
  children?: React.ReactNode;
}

export function Task({ className, ...props }: TaskProps) {
  return (
    <CollapsiblePrimitive.Root
      className={cn(
        'group rounded-lg border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export interface TaskTriggerProps
  extends Omit<
    React.ComponentProps<typeof CollapsiblePrimitive.Trigger>,
    'children'
  > {
  title: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'error';
}

export function TaskTrigger({
  title,
  status = 'pending',
  className,
  ...props
}: TaskTriggerProps) {
  const Icon = {
    pending: Circle,
    in_progress: Loader2,
    completed: CheckCircle2,
    error: XCircle,
  }[status];

  const iconClassName = cn('h-4 w-4 shrink-0', {
    'text-muted-foreground': status === 'pending',
    'text-primary animate-spin': status === 'in_progress',
    'text-green-500': status === 'completed',
    'text-red-500': status === 'error',
  });

  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        'flex w-full items-center justify-between gap-2 p-4 text-left transition-colors hover:bg-muted/50 [&[data-state=open]>svg:last-child]:rotate-180',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className={iconClassName} />
        <span className="font-medium text-sm truncate">{title}</span>
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </CollapsiblePrimitive.Trigger>
  );
}

export function TaskContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      className={cn('border-t px-4 py-3 text-sm', className)}
      {...props}
    />
  );
}

export function TaskItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 py-1.5 text-muted-foreground',
        className,
      )}
      {...props}
    >
      <Circle className="h-1.5 w-1.5 mt-1.5 fill-current shrink-0" />
      <div className="flex-1 min-w-0">{props.children}</div>
    </div>
  );
}

export function TaskItemFile({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-mono',
        className,
      )}
      {...props}
    />
  );
}

