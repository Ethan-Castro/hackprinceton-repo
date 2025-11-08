'use client';

import React, { createContext, useContext } from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shimmer } from './shimmer';

const PlanContext = createContext<{ isStreaming?: boolean }>({});

export interface PlanProps
  extends Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, 'children'> {
  isStreaming?: boolean;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

export function Plan({
  isStreaming = false,
  defaultOpen,
  children,
  ...props
}: PlanProps) {
  return (
    <PlanContext.Provider value={{ isStreaming }}>
      <CollapsiblePrimitive.Root defaultOpen={defaultOpen} {...props}>
        <Card className="overflow-hidden">{children}</Card>
      </CollapsiblePrimitive.Root>
    </PlanContext.Provider>
  );
}

export function PlanHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      className={cn('flex flex-row items-center gap-2 space-y-0', className)}
      {...props}
    />
  );
}

export function PlanTitle({
  children,
  ...props
}: Omit<React.ComponentProps<typeof CardTitle>, 'children'> & {
  children: string;
}) {
  const { isStreaming } = useContext(PlanContext);

  if (isStreaming && children) {
    return (
      <CardTitle {...props}>
        <Shimmer>{children}</Shimmer>
      </CardTitle>
    );
  }

  return <CardTitle {...props}>{children}</CardTitle>;
}

export function PlanDescription({
  children,
  ...props
}: Omit<React.ComponentProps<typeof CardDescription>, 'children'> & {
  children: string;
}) {
  const { isStreaming } = useContext(PlanContext);

  if (isStreaming && children) {
    return (
      <CardDescription {...props}>
        <Shimmer className="text-sm">{children}</Shimmer>
      </CardDescription>
    );
  }

  return <CardDescription {...props}>{children}</CardDescription>;
}

export function PlanTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className={cn('p-0 h-auto hover:bg-transparent', className)}
        {...props}
      >
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:rotate-[-90deg]" />
        <span className="sr-only">Toggle plan details</span>
      </Button>
    </CollapsiblePrimitive.Trigger>
  );
}

export function PlanContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CollapsiblePrimitive.Content asChild>
      <CardContent className={cn('pt-0', className)} {...props} />
    </CollapsiblePrimitive.Content>
  );
}

export function PlanFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-t px-6 py-3',
        className,
      )}
      {...props}
    />
  );
}

export function PlanAction({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />;
}

