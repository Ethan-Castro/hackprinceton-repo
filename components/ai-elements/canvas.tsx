'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type FitViewOptions,
  type DefaultEdgeOptions,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type ConnectionLineComponent,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
  defaultEdgeOptions?: DefaultEdgeOptions;
  connectionLineComponent?: ConnectionLineComponent;
  className?: string;
  children?: React.ReactNode;
}

export function Canvas({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  fitView = false,
  fitViewOptions,
  defaultEdgeOptions,
  connectionLineComponent,
  className = '',
  children,
}: CanvasProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView={fitView}
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineComponent={connectionLineComponent}
        className="bg-background"
        panOnScroll={true}
        selectionOnDrag={true}
        deleteKeyCode={['Backspace', 'Delete']}
        zoomOnDoubleClick={false}
        panOnDrag={false}
      >
        <Background className="bg-muted/30" />
        {children}
      </ReactFlow>
    </div>
  );
}
