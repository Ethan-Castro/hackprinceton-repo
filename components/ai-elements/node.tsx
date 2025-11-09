'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

interface NodeProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  handles?: {
    target?: boolean;
    source?: boolean;
  };
}

export function Node({ children, handles = { target: true, source: true }, className, ...props }: NodeProps) {
  return (
    <div className="relative">
      {handles.target && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-primary !border-2 !border-primary-foreground !w-3 !h-3"
        />
      )}
      <Card className={cn('w-sm', className)} {...props}>
        {children}
      </Card>
      {handles.source && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-primary !border-2 !border-primary-foreground !w-3 !h-3"
        />
      )}
    </div>
  );
}

export function NodeHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('border-b', className)} {...props} />;
}

export function NodeTitle(props: React.ComponentProps<typeof CardTitle>) {
  return <CardTitle {...props} />;
}

export function NodeDescription(props: React.ComponentProps<typeof CardDescription>) {
  return <CardDescription {...props} />;
}

export function NodeAction(props: React.ComponentProps<typeof CardAction>) {
  return <CardAction {...props} />;
}

export function NodeContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={className} {...props} />;
}

export function NodeFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return <CardFooter className={cn('border-t', className)} {...props} />;
}
