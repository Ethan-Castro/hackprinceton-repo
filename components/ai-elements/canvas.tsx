'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface CanvasProps extends Omit<ReactFlowProps, 'children'> {
  children?: React.ReactNode;
}

export function Canvas({
  children,
  className,
  ...props
}: CanvasProps) {
  return (
    <div className={`h-full w-full ${className ?? ''}`}>
      <ReactFlow
        className="bg-background"
        panOnScroll={true}
        selectionOnDrag={true}
        deleteKeyCode={['Backspace', 'Delete']}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        {...props}
      >
        <Background className="bg-muted/30" />
        {children}
      </ReactFlow>
    </div>
  );
}
