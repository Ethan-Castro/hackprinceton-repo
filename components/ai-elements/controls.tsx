'use client';

import React, { type ComponentProps } from 'react';
import { Controls as ReactFlowControls } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface ControlsProps extends ComponentProps<typeof ReactFlowControls> {
  className?: string;
}

export function Controls({ className, ...props }: ControlsProps) {
  return (
    <ReactFlowControls
      className={cn(
        'rounded-full border bg-card/80 backdrop-blur-sm shadow-md [&>button]:border-0 [&>button]:bg-transparent',
        className
      )}
      showInteractive={false}
      {...props}
    />
  );
}
