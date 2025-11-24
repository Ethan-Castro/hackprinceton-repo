'use client';

import React from 'react';
import { Chat } from '@/components/chat';
import { Canvas } from '@/components/ai-elements/canvas';
import { Connection } from '@/components/ai-elements/connection';
import { Controls } from '@/components/ai-elements/controls';
import { Edge } from '@/components/ai-elements/edge';
import {
  Node,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
} from '@/components/ai-elements/node';
import { Panel } from '@/components/ai-elements/panel';
import { Toolbar } from '@/components/ai-elements/toolbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Node Types Definition
const nodeTypes = {
  workflow: ({
    data,
  }: {
    data: {
      label: string;
      description: string;
      handles: { target: boolean; source: boolean };
      content: string;
      footer: string;
      status?: 'default' | 'success' | 'warning' | 'error';
    };
  }) => (
    <Node handles={data.handles}>
      <NodeHeader>
        <div className="flex items-center justify-between">
          <NodeTitle>{data.label}</NodeTitle>
          {data.status && (
            <Badge 
              variant={data.status === 'default' ? 'secondary' : data.status === 'success' ? 'default' : data.status === 'warning' ? 'outline' : 'destructive'} 
              className="text-[10px] h-5 px-1.5"
            >
              {data.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <NodeDescription>{data.description}</NodeDescription>
      </NodeHeader>
      <NodeContent>
        <p className="text-sm text-muted-foreground">{data.content}</p>
      </NodeContent>
      <NodeFooter>
        <p className="text-muted-foreground text-xs font-mono">{data.footer}</p>
      </NodeFooter>
      <Toolbar>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
          Details
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
          Logs
        </Button>
      </Toolbar>
    </Node>
  ),
};

// Edge Types Definition
const edgeTypes = {
  animated: Edge.Animated,
  temporary: Edge.Temporary,
  default: Edge.Default,
};

// Time Saved Workflow Data
const timeSavedNodes = [
  {
    id: 'ts-start',
    type: 'workflow',
    position: { x: 0, y: 200 },
    data: {
      label: 'User Request',
      description: 'Initial API Call',
      handles: { target: false, source: true },
      content: 'POST /api/generate\nPayload: 2.4KB',
      footer: 'T=0ms',
      status: 'default',
    },
  },
  {
    id: 'ts-gateway',
    type: 'workflow',
    position: { x: 300, y: 200 },
    data: {
      label: 'AI Gateway',
      description: 'Smart Routing & Auth',
      handles: { target: true, source: true },
      content: 'Routing to optimal providers based on latency & cost',
      footer: 'Latency: 12ms',
      status: 'success',
    },
  },
  {
    id: 'ts-model-a',
    type: 'workflow',
    position: { x: 700, y: 0 },
    data: {
      label: 'Fast Model (Groq)',
      description: 'Initial Reasoning',
      handles: { target: true, source: true },
      content: 'Llama 3 70B\nTokens: 450/s',
      footer: 'Duration: 145ms',
      status: 'success',
    },
  },
  {
    id: 'ts-model-b',
    type: 'workflow',
    position: { x: 700, y: 200 },
    data: {
      label: 'Code Model (Claude)',
      description: 'Syntax Check',
      handles: { target: true, source: true },
      content: 'Claude 3.5 Sonnet\nCode Analysis',
      footer: 'Duration: 850ms',
      status: 'success',
    },
  },
  {
    id: 'ts-model-c',
    type: 'workflow',
    position: { x: 700, y: 400 },
    data: {
      label: 'Safety Check',
      description: 'Guardrails',
      handles: { target: true, source: true },
      content: 'Content Moderation\nPII Detection',
      footer: 'Duration: 45ms',
      status: 'default',
    },
  },
  {
    id: 'ts-agg',
    type: 'workflow',
    position: { x: 1100, y: 200 },
    data: {
      label: 'Response Aggregator',
      description: 'Synthesize Results',
      handles: { target: true, source: true },
      content: 'Combining streams and validating outputs',
      footer: 'Processing: 5ms',
      status: 'success',
    },
  },
  {
    id: 'ts-end',
    type: 'workflow',
    position: { x: 1400, y: 200 },
    data: {
      label: 'Client Response',
      description: 'Final Output',
      handles: { target: true, source: false },
      content: 'Stream complete.\nTotal Latency Saved: 60%',
      footer: 'Total T=912ms',
      status: 'success',
    },
  },
];

const timeSavedEdges = [
  { id: 'e-ts-1', source: 'ts-start', target: 'ts-gateway', type: 'animated' },
  { id: 'e-ts-2', source: 'ts-gateway', target: 'ts-model-a', type: 'animated' },
  { id: 'e-ts-3', source: 'ts-gateway', target: 'ts-model-b', type: 'animated' },
  { id: 'e-ts-4', source: 'ts-gateway', target: 'ts-model-c', type: 'animated' },
  { id: 'e-ts-5', source: 'ts-model-a', target: 'ts-agg', type: 'animated' },
  { id: 'e-ts-6', source: 'ts-model-b', target: 'ts-agg', type: 'animated' },
  { id: 'e-ts-7', source: 'ts-model-c', target: 'ts-agg', type: 'animated' },
  { id: 'e-ts-8', source: 'ts-agg', target: 'ts-end', type: 'animated' },
];

// Workflows Changed Data
const workflowsChangedNodes = [
  {
    id: 'wc-start',
    type: 'workflow',
    position: { x: 0, y: 250 },
    data: {
      label: 'Legacy Trigger',
      description: 'Scheduled Job',
      handles: { target: false, source: true },
      content: 'CRON: Daily at 00:00\nBatch: 50k records',
      footer: 'Status: Active',
      status: 'default',
    },
  },
  {
    id: 'wc-linear-start',
    type: 'workflow',
    position: { x: 300, y: 50 },
    data: {
      label: 'Old: Sequential',
      description: 'Linear Processing',
      handles: { target: true, source: true },
      content: 'Step 1 -> Step 2 -> Step 3\nBlocking execution',
      footer: 'Avg Time: 4h 20m',
      status: 'warning',
    },
  },
  {
    id: 'wc-gateway',
    type: 'workflow',
    position: { x: 300, y: 400 },
    data: {
      label: 'New: AI Gateway',
      description: 'Parallel Orchestration',
      handles: { target: true, source: true },
      content: 'Fan-out to multiple agents\nAsync processing',
      footer: 'Throughput: 100x',
      status: 'success',
    },
  },
  {
    id: 'wc-agent-1',
    type: 'workflow',
    position: { x: 700, y: 300 },
    data: {
      label: 'Research Agent',
      description: 'Data Gathering',
      handles: { target: true, source: true },
      content: 'Searching vector DBs\nWeb scraping',
      footer: 'Time: 45s',
      status: 'success',
    },
  },
  {
    id: 'wc-agent-2',
    type: 'workflow',
    position: { x: 700, y: 500 },
    data: {
      label: 'Analysis Agent',
      description: 'Data Processing',
      handles: { target: true, source: true },
      content: 'Summarization\nSentiment Analysis',
      footer: 'Time: 30s',
      status: 'success',
    },
  },
  {
    id: 'wc-decision',
    type: 'workflow',
    position: { x: 1100, y: 400 },
    data: {
      label: 'Comparison Logic',
      description: 'Eval & Merge',
      handles: { target: true, source: true },
      content: 'Compare results vs Legacy\nMerge streams',
      footer: 'Quality Score: 98%',
      status: 'success',
    },
  },
  {
    id: 'wc-output',
    type: 'workflow',
    position: { x: 1500, y: 250 },
    data: {
      label: 'Optimized Output',
      description: 'Final Delivery',
      handles: { target: true, source: false },
      content: 'Real-time dashboard update\nNotification sent',
      footer: 'Total Time: 2m 15s',
      status: 'success',
    },
  },
];

const workflowsChangedEdges = [
  { id: 'e-wc-1', source: 'wc-start', target: 'wc-linear-start', type: 'temporary', label: 'Legacy Path' },
  { id: 'e-wc-2', source: 'wc-start', target: 'wc-gateway', type: 'animated', label: 'New Path' },
  { id: 'e-wc-3', source: 'wc-gateway', target: 'wc-agent-1', type: 'animated' },
  { id: 'e-wc-4', source: 'wc-gateway', target: 'wc-agent-2', type: 'animated' },
  { id: 'e-wc-5', source: 'wc-agent-1', target: 'wc-decision', type: 'animated' },
  { id: 'e-wc-6', source: 'wc-agent-2', target: 'wc-decision', type: 'animated' },
  { id: 'e-wc-7', source: 'wc-decision', target: 'wc-output', type: 'animated' },
  { id: 'e-wc-8', source: 'wc-linear-start', target: 'wc-output', type: 'temporary' },
];

// Innovation Workflow Data
const innovationNodes = [
  {
    id: 'in-ideation',
    type: 'workflow',
    position: { x: 0, y: 200 },
    data: {
      label: 'Ideation',
      description: 'New Feature Concept',
      handles: { target: false, source: true },
      content: 'Goal: Auto-generated personalized newsletters',
      footer: 'Phase: Discovery',
      status: 'success',
    },
  },
  {
    id: 'in-prototype',
    type: 'workflow',
    position: { x: 350, y: 200 },
    data: {
      label: 'Rapid Prototype',
      description: 'Vercel AI SDK',
      handles: { target: true, source: true },
      content: 'Built with v0 & AI SDK\nConnected to test DB',
      footer: 'Time to MVP: 2 days',
      status: 'success',
    },
  },
  {
    id: 'in-test',
    type: 'workflow',
    position: { x: 700, y: 200 },
    data: {
      label: 'Eval & Test',
      description: 'Simulation',
      handles: { target: true, source: true },
      content: 'Running 500 test cases\nChecking hallucination rate',
      footer: 'Accuracy: 94.5%',
      status: 'success',
    },
  },
  {
    id: 'in-optimize',
    type: 'workflow',
    position: { x: 1050, y: 200 },
    data: {
      label: 'Optimize',
      description: 'Gateway Config',
      handles: { target: true, source: true },
      content: 'Caching enabled\nRate limits set',
      footer: 'Cost reduced: 40%',
      status: 'success',
    },
  },
  {
    id: 'in-deploy',
    type: 'workflow',
    position: { x: 1400, y: 200 },
    data: {
      label: 'Deploy',
      description: 'Production',
      handles: { target: true, source: true },
      content: 'Vercel Edge Functions\nGlobal availability',
      footer: 'Status: Live',
      status: 'success',
    },
  },
  {
    id: 'in-monitor',
    type: 'workflow',
    position: { x: 1750, y: 200 },
    data: {
      label: 'Monitor',
      description: 'Feedback Loop',
      handles: { target: true, source: false },
      content: 'Real-time analytics\nUser feedback collection',
      footer: 'NPS: +62',
      status: 'default',
    },
  },
];

const innovationEdges = [
  { id: 'e-in-1', source: 'in-ideation', target: 'in-prototype', type: 'animated' },
  { id: 'e-in-2', source: 'in-prototype', target: 'in-test', type: 'animated' },
  { id: 'e-in-3', source: 'in-test', target: 'in-optimize', type: 'animated' },
  { id: 'e-in-4', source: 'in-optimize', target: 'in-deploy', type: 'animated' },
  { id: 'e-in-5', source: 'in-deploy', target: 'in-monitor', type: 'animated' },
];

function InnovationWorkflow() {
  return (
    <Canvas
      nodes={innovationNodes}
      edges={innovationEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      connectionLineComponent={Connection}
    >
      <Controls />
      <Panel position="top-right">
        <Button size="sm">
          Create New Pipeline
        </Button>
      </Panel>
    </Canvas>
  );
}

function WorkflowsChangedWorkflow() {
  return (
    <Canvas
      nodes={workflowsChangedNodes}
      edges={workflowsChangedEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      connectionLineComponent={Connection}
    >
      <Controls />
      <Panel position="top-right">
        <div className="flex gap-2">
            <Button size="sm" variant="secondary">
            View Comparison
            </Button>
        </div>
      </Panel>
    </Canvas>
  );
}

function TimeSavedWorkflow() {
  return (
    <Canvas
      nodes={timeSavedNodes}
      edges={timeSavedEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      connectionLineComponent={Connection}
    >
      <Controls />
      <Panel position="top-right">
        <div className="flex gap-2">
            <Button size="sm" variant="outline">
            Simulate Request
            </Button>
            <Button size="sm">
            View Telemetry
            </Button>
        </div>
      </Panel>
    </Canvas>
  );
}

export default function WorkflowPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="px-6 py-4 border-b bg-background z-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Workflow Visualizations</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Explore how the AI Gateway transforms operations through optimized routing, parallel processing, and innovation acceleration.
        </p>
      </div>
      
      <Tabs defaultValue="time-saved" className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="time-saved">Time Saved</TabsTrigger>
            <TabsTrigger value="workflows-changed">Workflows Changed</TabsTrigger>
            <TabsTrigger value="innovation">Innovation</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="time-saved" className="flex-1 p-0 m-0 h-full relative border-t mt-0">
          <TimeSavedWorkflow />
        </TabsContent>
        
        <TabsContent value="workflows-changed" className="flex-1 p-0 m-0 h-full relative border-t mt-0">
          <WorkflowsChangedWorkflow />
        </TabsContent>
        
        <TabsContent value="innovation" className="flex-1 p-0 m-0 h-full relative border-t mt-0">
          <InnovationWorkflow />
        </TabsContent>

        <TabsContent value="interactive" className="flex-1 overflow-y-auto border-t mt-0 bg-muted/30">
          <div className="max-w-6xl mx-auto w-full p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em]">
                    McKinsey Feature
                  </p>
                  <h2 className="text-2xl font-semibold leading-tight">The State of AI</h2>
                  <p className="text-sm text-muted-foreground">
                    Read the article in-page and collaborate with the chat assistant below.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open article
                  </a>
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden border bg-background shadow-sm">
                <iframe
                  src="https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai"
                  title="McKinsey: The State of AI"
                  className="w-full h-[75vh] min-h-[520px]"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <p className="text-xs text-muted-foreground">
                If the site blocks embedding, use the button above to open the article directly.
              </p>
            </div>

            <div className="rounded-2xl border bg-background shadow-sm p-4 md:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">Interactive Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture insights, summarize sections, or ask follow-up questions.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border bg-muted/20 overflow-hidden">
                <Chat embedded />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
