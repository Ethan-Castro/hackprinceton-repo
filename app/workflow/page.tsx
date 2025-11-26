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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  Code2,
  Database,
  GitBranch,
  LayoutDashboard,
  Plug,
  Rocket,
  ShieldCheck,
} from 'lucide-react';

// Node Types Definition
const nodeTypes = {
  workflow: ({
    data,
  }: {
    data: {
      label: string;
      description: string;
      handles: { target: boolean; source: boolean };
      content?: string;
      footer?: string;
    };
  }) => (
    <Node handles={data.handles}>
      <NodeHeader>
        <NodeTitle>{data.label}</NodeTitle>
        <NodeDescription>{data.description}</NodeDescription>
      </NodeHeader>
      <NodeContent>
        <p className="text-sm text-muted-foreground">{data.content || 'test'}</p>
      </NodeContent>
      <NodeFooter>
        <p className="text-muted-foreground text-xs font-mono">{data.footer || 'test'}</p>
      </NodeFooter>
    </Node>
  ),
};

// Edge Types Definition
const edgeTypes = {
  animated: Edge.Animated,
  temporary: Edge.Temporary,
};

const templateHighlights = [
  {
    title: 'Visual Workflow Builder',
    description:
      'Drag-and-drop canvas powered by React Flow and Workflow DevKit with execution logs that mirror production runs.',
    badge: 'UI + DevKit',
    icon: LayoutDashboard,
  },
  {
    title: 'Ship-Ready Integrations',
    description:
      'Better Auth, Neon Postgres via Drizzle, and real connectors for Resend, Linear, Slack, external APIs, and SQL.',
    badge: 'Auth · DB · Integrations',
    icon: Plug,
  },
  {
    title: 'Code Generation',
    description:
      'Convert workflows to type-safe TypeScript with the "use workflow" directive, error handling, and execution logging.',
    badge: 'TypeScript',
    icon: Code2,
  },
  {
    title: 'Observability',
    description:
      'Execution history, run logs, and AI Gateway-powered generation with streaming for rapid iteration.',
    badge: 'Runs & Logs',
    icon: Activity,
  },
];

const apiSections = [
  {
    title: 'Workflow Management',
    endpoints: [
      { method: 'GET', path: '/api/workflows', description: 'List workflows' },
      { method: 'POST', path: '/api/workflows', description: 'Create workflow' },
      { method: 'GET', path: '/api/workflows/{id}', description: 'Get workflow' },
      { method: 'PUT', path: '/api/workflows/{id}', description: 'Update workflow' },
      { method: 'DELETE', path: '/api/workflows/{id}', description: 'Delete workflow' },
    ],
  },
  {
    title: 'Execution',
    endpoints: [
      { method: 'POST', path: '/api/workflows/{id}/execute', description: 'Run workflow' },
      { method: 'GET', path: '/api/workflows/{id}/executions', description: 'Execution history' },
      { method: 'GET', path: '/api/workflows/executions/{executionId}/logs', description: 'Execution logs' },
    ],
  },
  {
    title: 'Code & AI Generation',
    endpoints: [
      { method: 'GET', path: '/api/workflows/{id}/generate-code', description: 'Generate TypeScript' },
      { method: 'POST', path: '/api/workflows/{id}/generate-code', description: 'Generate with options' },
      { method: 'POST', path: '/api/ai/generate-workflow', description: 'Create workflow from prompt' },
    ],
  },
];

const stackItems = [
  { label: 'Framework', value: 'Next.js 16 + React 19', icon: Rocket },
  { label: 'Engine', value: 'Workflow DevKit', icon: GitBranch },
  { label: 'AI', value: 'OpenAI via AI Gateway', icon: Activity },
  { label: 'Auth', value: 'Better Auth', icon: ShieldCheck },
  { label: 'Database', value: 'Neon Postgres + Drizzle', icon: Database },
  { label: 'UI', value: 'shadcn/ui + Tailwind', icon: LayoutDashboard },
  { label: 'State', value: 'Jotai', icon: Code2 },
  { label: 'Editor', value: 'Monaco', icon: Code2 },
];

const setupSteps = [
  {
    title: 'Install & migrate',
    detail: 'pnpm install · pnpm db:push',
    note: 'Neon Postgres is provisioned automatically on Vercel deploys.',
  },
  {
    title: 'Configure env',
    detail: 'DATABASE_URL · BETTER_AUTH_SECRET · BETTER_AUTH_URL · AI_GATEWAY_API_KEY',
    note: 'Use .env.local locally; deployment prompts for required secrets.',
  },
  {
    title: 'Run locally',
    detail: 'pnpm dev',
    note: 'Start building workflows at http://localhost:3000.',
  },
];

const workflowTypes = {
  triggers: ['Webhook', 'Schedule', 'Manual', 'Database Event'],
  actions: ['Send Email (Resend)', 'Create Ticket (Linear)', 'Database Query', 'HTTP Request'],
};

// Time Saved Workflow Data
const timeSavedIds = {
  start: 'ts-start',
  gateway: 'ts-gateway',
  modelA: 'ts-model-a',
  modelB: 'ts-model-b',
  modelC: 'ts-model-c',
  agg: 'ts-agg',
  end: 'ts-end',
};

const timeSavedNodes = [
  {
    id: timeSavedIds.start,
    type: 'workflow',
    position: { x: 0, y: 200 },
    data: {
      label: 'User Request',
      description: 'Initial API Call',
      handles: { target: false, source: true },
      content: 'POST /api/generate\nPayload: 2.4KB',
      footer: 'T=0ms',
    },
  },
  {
    id: timeSavedIds.gateway,
    type: 'workflow',
    position: { x: 300, y: 200 },
    data: {
      label: 'AI Gateway',
      description: 'Smart Routing & Auth',
      handles: { target: true, source: true },
      content: 'Routing to optimal providers based on latency & cost',
      footer: 'Latency: 12ms',
    },
  },
  {
    id: timeSavedIds.modelA,
    type: 'workflow',
    position: { x: 700, y: 0 },
    data: {
      label: 'Fast Model (Groq)',
      description: 'Initial Reasoning',
      handles: { target: true, source: true },
      content: 'Llama 3 70B\nTokens: 450/s',
      footer: 'Duration: 145ms',
    },
  },
  {
    id: timeSavedIds.modelB,
    type: 'workflow',
    position: { x: 700, y: 200 },
    data: {
      label: 'Code Model (Claude)',
      description: 'Syntax Check',
      handles: { target: true, source: true },
      content: 'Claude 3.5 Sonnet\nCode Analysis',
      footer: 'Duration: 850ms',
    },
  },
  {
    id: timeSavedIds.modelC,
    type: 'workflow',
    position: { x: 700, y: 400 },
    data: {
      label: 'Safety Check',
      description: 'Guardrails',
      handles: { target: true, source: true },
      content: 'Content Moderation\nPII Detection',
      footer: 'Duration: 45ms',
    },
  },
  {
    id: timeSavedIds.agg,
    type: 'workflow',
    position: { x: 1100, y: 200 },
    data: {
      label: 'Response Aggregator',
      description: 'Synthesize Results',
      handles: { target: true, source: true },
      content: 'Combining streams and validating outputs',
      footer: 'Processing: 5ms',
    },
  },
  {
    id: timeSavedIds.end,
    type: 'workflow',
    position: { x: 1400, y: 200 },
    data: {
      label: 'Client Response',
      description: 'Final Output',
      handles: { target: true, source: false },
      content: 'Stream complete.\nTotal Latency Saved: 60%',
      footer: 'Total T=912ms',
    },
  },
];

const timeSavedEdges = [
  { id: 'ts-e1', source: timeSavedIds.start, target: timeSavedIds.gateway, type: 'animated' },
  { id: 'ts-e2', source: timeSavedIds.gateway, target: timeSavedIds.modelA, type: 'animated' },
  { id: 'ts-e3', source: timeSavedIds.gateway, target: timeSavedIds.modelB, type: 'animated' },
  { id: 'ts-e4', source: timeSavedIds.gateway, target: timeSavedIds.modelC, type: 'animated' },
  { id: 'ts-e5', source: timeSavedIds.modelA, target: timeSavedIds.agg, type: 'animated' },
  { id: 'ts-e6', source: timeSavedIds.modelB, target: timeSavedIds.agg, type: 'animated' },
  { id: 'ts-e7', source: timeSavedIds.modelC, target: timeSavedIds.agg, type: 'animated' },
  { id: 'ts-e8', source: timeSavedIds.agg, target: timeSavedIds.end, type: 'animated' },
];

// Workflows Changed Data
const changedIds = {
  start: 'wc-start',
  linearStart: 'wc-linear-start',
  gateway: 'wc-gateway',
  agent1: 'wc-agent-1',
  agent2: 'wc-agent-2',
  decision: 'wc-decision',
  output: 'wc-output',
};

const workflowsChangedNodes = [
  {
    id: changedIds.start,
    type: 'workflow',
    position: { x: 0, y: 250 },
    data: {
      label: 'Legacy Trigger',
      description: 'Scheduled Job',
      handles: { target: false, source: true },
      content: 'CRON: Daily at 00:00\nBatch: 50k records',
      footer: 'Status: Active',
    },
  },
  {
    id: changedIds.linearStart,
    type: 'workflow',
    position: { x: 300, y: 50 },
    data: {
      label: 'Old: Sequential',
      description: 'Linear Processing',
      handles: { target: true, source: true },
      content: 'Step 1 -> Step 2 -> Step 3\nBlocking execution',
      footer: 'Avg Time: 4h 20m',
    },
  },
  {
    id: changedIds.gateway,
    type: 'workflow',
    position: { x: 300, y: 400 },
    data: {
      label: 'New: AI Gateway',
      description: 'Parallel Orchestration',
      handles: { target: true, source: true },
      content: 'Fan-out to multiple agents\nAsync processing',
      footer: 'Throughput: 100x',
    },
  },
  {
    id: changedIds.agent1,
    type: 'workflow',
    position: { x: 700, y: 300 },
    data: {
      label: 'Research Agent',
      description: 'Data Gathering',
      handles: { target: true, source: true },
      content: 'Searching vector DBs\nWeb scraping',
      footer: 'Time: 45s',
    },
  },
  {
    id: changedIds.agent2,
    type: 'workflow',
    position: { x: 700, y: 500 },
    data: {
      label: 'Analysis Agent',
      description: 'Data Processing',
      handles: { target: true, source: true },
      content: 'Summarization\nSentiment Analysis',
      footer: 'Time: 30s',
    },
  },
  {
    id: changedIds.decision,
    type: 'workflow',
    position: { x: 1100, y: 400 },
    data: {
      label: 'Comparison Logic',
      description: 'Eval & Merge',
      handles: { target: true, source: true },
      content: 'Compare results vs Legacy\nMerge streams',
      footer: 'Quality Score: 98%',
    },
  },
  {
    id: changedIds.output,
    type: 'workflow',
    position: { x: 1500, y: 250 },
    data: {
      label: 'Optimized Output',
      description: 'Final Delivery',
      handles: { target: true, source: false },
      content: 'Real-time dashboard update\nNotification sent',
      footer: 'Total Time: 2m 15s',
    },
  },
];

const workflowsChangedEdges = [
  { id: 'wc-e1', source: changedIds.start, target: changedIds.linearStart, type: 'temporary', label: 'Legacy Path' },
  { id: 'wc-e2', source: changedIds.start, target: changedIds.gateway, type: 'animated', label: 'New Path' },
  { id: 'wc-e3', source: changedIds.gateway, target: changedIds.agent1, type: 'animated' },
  { id: 'wc-e4', source: changedIds.gateway, target: changedIds.agent2, type: 'animated' },
  { id: 'wc-e5', source: changedIds.agent1, target: changedIds.decision, type: 'animated' },
  { id: 'wc-e6', source: changedIds.agent2, target: changedIds.decision, type: 'animated' },
  { id: 'wc-e7', source: changedIds.decision, target: changedIds.output, type: 'animated' },
  { id: 'wc-e8', source: changedIds.linearStart, target: changedIds.output, type: 'temporary' },
];

// Innovation Workflow Data
const innovationIds = {
  ideation: 'in-ideation',
  prototype: 'in-prototype',
  test: 'in-test',
  optimize: 'in-optimize',
  deploy: 'in-deploy',
  monitor: 'in-monitor',
};

const innovationNodes = [
  {
    id: innovationIds.ideation,
    type: 'workflow',
    position: { x: 0, y: 200 },
    data: {
      label: 'Ideation',
      description: 'New Feature Concept',
      handles: { target: false, source: true },
      content: 'Goal: Auto-generated personalized newsletters',
      footer: 'Phase: Discovery',
    },
  },
  {
    id: innovationIds.prototype,
    type: 'workflow',
    position: { x: 350, y: 200 },
    data: {
      label: 'Rapid Prototype',
      description: 'Vercel AI SDK',
      handles: { target: true, source: true },
      content: 'Built with v0 & AI SDK\nConnected to test DB',
      footer: 'Time to MVP: 2 days',
    },
  },
  {
    id: innovationIds.test,
    type: 'workflow',
    position: { x: 700, y: 200 },
    data: {
      label: 'Eval & Test',
      description: 'Simulation',
      handles: { target: true, source: true },
      content: 'Running 500 test cases\nChecking hallucination rate',
      footer: 'Accuracy: 94.5%',
    },
  },
  {
    id: innovationIds.optimize,
    type: 'workflow',
    position: { x: 1050, y: 200 },
    data: {
      label: 'Optimize',
      description: 'Gateway Config',
      handles: { target: true, source: true },
      content: 'Caching enabled\nRate limits set',
      footer: 'Cost reduced: 40%',
    },
  },
  {
    id: innovationIds.deploy,
    type: 'workflow',
    position: { x: 1400, y: 200 },
    data: {
      label: 'Deploy',
      description: 'Production',
      handles: { target: true, source: true },
      content: 'Vercel Edge Functions\nGlobal availability',
      footer: 'Status: Live',
    },
  },
  {
    id: innovationIds.monitor,
    type: 'workflow',
    position: { x: 1750, y: 200 },
    data: {
      label: 'Monitor',
      description: 'Feedback Loop',
      handles: { target: true, source: false },
      content: 'Real-time analytics\nUser feedback collection',
      footer: 'NPS: +62',
    },
  },
];

const innovationEdges = [
  { id: 'in-e1', source: innovationIds.ideation, target: innovationIds.prototype, type: 'animated' },
  { id: 'in-e2', source: innovationIds.prototype, target: innovationIds.test, type: 'animated' },
  { id: 'in-e3', source: innovationIds.test, target: innovationIds.optimize, type: 'animated' },
  { id: 'in-e4', source: innovationIds.optimize, target: innovationIds.deploy, type: 'animated' },
  { id: 'in-e5', source: innovationIds.deploy, target: innovationIds.monitor, type: 'animated' },
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

function WorkflowTemplateTab() {
  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-8 space-y-6">
      <Card className="border-none shadow-sm bg-background">
        <CardHeader className="gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit">
                AI Workflow Builder Template
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-light tracking-tight">
                  Build and deploy workflow automation faster
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  Full-stack template from Vercel Labs: visual workflow builder on Workflow DevKit with auth, database, integrations, and code generation ready to ship.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Neon Postgres</Badge>
                <Badge variant="secondary">Better Auth</Badge>
                <Badge variant="secondary">AI Gateway</Badge>
                <Badge variant="secondary">React Flow</Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button asChild>
                <a href="https://github.com/vercel-labs/workflow-builder-template" target="_blank" rel="noreferrer">
                  View repo
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://vercel.com/new/clone?demo-title=AI%20Workflow%20Builder&demo-description=Deploy%20the%20Vercel%20workflow%20builder%20template&repository-name=workflow-builder-template&repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fworkflow-builder-template"
                  target="_blank"
                  rel="noreferrer"
                >
                  Deploy with Vercel
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {templateHighlights.map((item) => (
            <Card key={item.title} className="bg-muted/30 border-dashed">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary" />
                  <Badge variant="outline" className="text-[11px]">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-primary/10 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-xl">API surface</CardTitle>
          <CardDescription>REST endpoints are ready for workflow CRUD, execution, codegen, and AI generation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {apiSections.map((section) => (
            <div key={section.title} className="space-y-3 rounded-xl border border-border/50 bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{section.title}</p>
                <Badge variant="outline" className="text-[11px]">
                  {section.endpoints.length} routes
                </Badge>
              </div>
              <div className="space-y-2">
                {section.endpoints.map((endpoint) => (
                  <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-lg border border-dashed p-3 bg-muted/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {endpoint.method}
                      </span>
                      <code className="text-xs font-mono break-all text-foreground">{endpoint.path}</code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-xl">Stack & integrations</CardTitle>
          <CardDescription>Everything the template ships with on day one.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {stackItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-xl border p-3 bg-muted/30">
              <item.icon className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.12em]">
                  {item.label}
                </p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-muted/20 border-dashed">
        <CardHeader>
          <CardTitle className="text-xl">Build-ready workflow types</CardTitle>
          <CardDescription>Triggers and actions included out of the box.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-background p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Triggers</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {workflowTypes.triggers.map((trigger) => (
                <Badge key={trigger} variant="secondary" className="text-xs">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-background p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Actions</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {workflowTypes.actions.map((action) => (
                <Badge key={action} variant="secondary" className="text-xs">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-xl">Setup checklist</CardTitle>
          <CardDescription>From clone to running workflows in minutes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {setupSteps.map((step) => (
            <div key={step.title} className="rounded-xl border p-4 bg-muted/30 h-full flex flex-col gap-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.12em]">
                {step.title}
              </p>
              <p className="text-sm font-semibold">{step.detail}</p>
              <p className="text-xs text-muted-foreground">{step.note}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Includes scripts for build, lint, format, and type-check plus db tooling (db:generate, db:push, db:studio).
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://workflow-builder.dev" target="_blank" rel="noreferrer">
              View live demo
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
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
            <TabsTrigger value="template">Builder Template</TabsTrigger>
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

        <TabsContent value="template" className="flex-1 overflow-y-auto border-t mt-0 bg-muted/30">
          <WorkflowTemplateTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
