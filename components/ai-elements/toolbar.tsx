'use client';

import React from 'react';
import { NodeToolbar } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface ToolbarProps extends React.ComponentProps<typeof NodeToolbar> {
  children: React.ReactNode;
  className?: string;
}

export function Toolbar({ children, className, position = 'bottom', ...props }: ToolbarProps) {
  return (
    <NodeToolbar position={position} {...props}>
      <div className={cn('flex gap-1 rounded-lg border bg-card p-1 shadow-lg', className)}>
        {children}
      </div>
    </NodeToolbar>
  );
}
