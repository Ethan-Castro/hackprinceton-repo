'use client';

import React from 'react';
import { Panel as ReactFlowPanel, PanelPosition } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface PanelProps {
  children: React.ReactNode;
  position?: PanelPosition;
  className?: string;
}

export function Panel({ children, position = 'top-left', className }: PanelProps) {
  return (
    <ReactFlowPanel position={position} className={cn('z-10', className)}>
      <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-md flex gap-2">
        {children}
      </div>
    </ReactFlowPanel>
  );
}
