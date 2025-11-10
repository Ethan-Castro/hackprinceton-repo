'use client';

import React from 'react';
import { NodeToolbar } from '@xyflow/react';
import { cn } from '@/lib/utils';

type Position = NonNullable<React.ComponentProps<typeof NodeToolbar>['position']>;

interface ToolbarProps extends Omit<React.ComponentProps<typeof NodeToolbar>, 'position'> {
  children: React.ReactNode;
  className?: string;
  position?: Position;
}

export function Toolbar({ children, className, position, ...props }: ToolbarProps) {
  return (
    <NodeToolbar position={position ?? ('bottom' as Position)} {...props}>
      <div className={cn('flex gap-1 rounded-lg border bg-card p-1 shadow-lg', className)}>
        {children}
      </div>
    </NodeToolbar>
  );
}
