'use client';

import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlsProps {
  className?: string;
}

export function Controls({ className }: ControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-full border bg-card/80 backdrop-blur-sm p-1 shadow-md',
        className
      )}
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={() => zoomIn()}
        title="Zoom In"
        className="h-8 w-8"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => zoomOut()}
        title="Zoom Out"
        className="h-8 w-8"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => fitView()}
        title="Fit View"
        className="h-8 w-8"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
