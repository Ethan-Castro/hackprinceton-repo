'use client';

import React from 'react';
import { NodeToolbar } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface ToolbarProps extends Omit<React.ComponentProps<typeof NodeToolbar>, 'position'> {
  children: React.ReactNode;
  className?: string;
  position?: React.ComponentProps<typeof NodeToolbar>['position'];
}

export function Toolbar({ children, className, position, ...props }: ToolbarProps) {
  return (
    <NodeToolbar position={position ?? ('bottom' as const)} {...props}>
      <div className={cn('flex gap-1 rounded-lg border bg-card p-1 shadow-lg', className)}>
        {children}
      </div>
    </NodeToolbar>
  );
}
