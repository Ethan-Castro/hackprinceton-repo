'use client';

import { useState, useCallback } from 'react';
import {
  Canvas,
  Connection,
  Controls,
  Edge,
  Node,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
  Panel,
  Toolbar,
} from '@/components/ai-elements';
import { Button } from '@/components/ui/button';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node as FlowNode,
  type Edge as FlowEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import { Trash2, Edit, Sparkles } from 'lucide-react';

const nodeIds = {
  userInput: 'user-input',
  promptProcessing: 'prompt-processing',
  llmAnalysis: 'llm-analysis',
  dataExtraction: 'data-extraction',
  impactCalculation: 'impact-calculation',
  reportGeneration: 'report-generation',
  visualization: 'visualization',
};

const initialNodes: FlowNode[] = [
  {
    id: nodeIds.userInput,
    type: 'llm-workflow',
    position: { x: 0, y: 200 },
    data: {
      label: 'User Input',
      description: 'Sustainability query received',
      handles: { target: false, source: true },
      content: '"Calculate the carbon footprint of our Q4 2024 operations"',
      footer: 'Source: Dashboard Interface',
      icon: '💬',
    },
  },
  {
    id: nodeIds.promptProcessing,
    type: 'llm-workflow',
    position: { x: 350, y: 200 },
    data: {
      label: 'Prompt Processing',
      description: 'Intent analysis & context injection',
      handles: { target: true, source: true },
      content: 'Analyzing query intent, extracting timeframe (Q4 2024), scope (operations), and metric (carbon footprint)',
      footer: 'Processing time: ~100ms',
      icon: '⚙️',
    },
  },
  {
    id: nodeIds.llmAnalysis,
    type: 'llm-workflow',
    position: { x: 700, y: 200 },
    data: {
      label: 'LLM Analysis',
      description: 'Model inference & reasoning',
      handles: { target: true, source: true },
      content: 'Claude Sonnet analyzing data patterns, identifying relevant metrics, and applying sustainability frameworks',
      footer: 'Model: Claude Sonnet 4.5 | Tokens: 2,847',
      icon: '🧠',
    },
  },
  {
    id: nodeIds.dataExtraction,
    type: 'llm-workflow',
    position: { x: 1050, y: 50 },
    data: {
      label: 'Data Extraction',
      description: 'Retrieve relevant metrics',
      handles: { target: true, source: true },
      content: 'Querying: Energy consumption (1.2M kWh), Transportation (450k km), Waste (23 tons)',
      footer: 'Sources: 3 databases | Records: 12,847',
      icon: '📊',
    },
  },
  {
    id: nodeIds.impactCalculation,
    type: 'llm-workflow',
    position: { x: 1050, y: 350 },
    data: {
      label: 'Impact Calculation',
      description: 'Apply ESG methodologies',
      handles: { target: true, source: true },
      content: 'Calculating: Scope 1 (234 tCO2e), Scope 2 (567 tCO2e), Scope 3 (1,203 tCO2e)',
      footer: 'Framework: GHG Protocol | Confidence: 94%',
      icon: '🔢',
    },
  },
  {
    id: nodeIds.reportGeneration,
    type: 'llm-workflow',
    position: { x: 1400, y: 200 },
    data: {
      label: 'Report Generation',
      description: 'Synthesize insights & recommendations',
      handles: { target: true, source: true },
      content: 'Total Q4 2024 footprint: 2,004 tCO2e. 15% increase vs Q3. Key drivers: increased transportation (+28%), heating season onset.',
      footer: 'Generated: Natural language summary + charts',
      icon: '📝',
    },
  },
  {
    id: nodeIds.visualization,
    type: 'llm-workflow',
    position: { x: 1750, y: 200 },
    data: {
      label: 'Visualization',
      description: 'Present results to user',
      handles: { target: true, source: false },
      content: 'Interactive dashboard with trend charts, scope breakdown, and actionable recommendations',
      footer: 'Response time: 2.3s total',
      icon: '📈',
    },
  },
];

const initialEdges: FlowEdge[] = [
  {
    id: 'edge-1',
    source: nodeIds.userInput,
    target: nodeIds.promptProcessing,
    type: 'animated',
  },
  {
    id: 'edge-2',
    source: nodeIds.promptProcessing,
    target: nodeIds.llmAnalysis,
    type: 'animated',
  },
  {
    id: 'edge-3',
    source: nodeIds.llmAnalysis,
    target: nodeIds.dataExtraction,
    type: 'animated',
    label: 'Data needed',
  },
  {
    id: 'edge-4',
    source: nodeIds.llmAnalysis,
    target: nodeIds.impactCalculation,
    type: 'animated',
    label: 'Calculations needed',
  },
  {
    id: 'edge-5',
    source: nodeIds.dataExtraction,
    target: nodeIds.reportGeneration,
    type: 'temporary',
  },
  {
    id: 'edge-6',
    source: nodeIds.impactCalculation,
    target: nodeIds.reportGeneration,
    type: 'temporary',
  },
  {
    id: 'edge-7',
    source: nodeIds.reportGeneration,
    target: nodeIds.visualization,
    type: 'animated',
  },
];

const nodeTypes = {
  'llm-workflow': ({
    data,
  }: {
    data: {
      label: string;
      description: string;
      handles: { target: boolean; source: boolean };
      content: string;
      footer: string;
      icon: string;
    };
  }) => (
    <Node handles={data.handles}>
      <NodeHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{data.icon}</span>
          <div>
            <NodeTitle>{data.label}</NodeTitle>
            <NodeDescription>{data.description}</NodeDescription>
          </div>
        </div>
      </NodeHeader>
      <NodeContent>
        <p className="text-sm leading-relaxed">{data.content}</p>
      </NodeContent>
      <NodeFooter>
        <p className="text-muted-foreground text-xs">{data.footer}</p>
      </NodeFooter>
      <Toolbar>
        <Button size="sm" variant="ghost">
          <Edit className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost">
          <Trash2 className="h-3 w-3" />
        </Button>
      </Toolbar>
    </Node>
  ),
};

const edgeTypes = {
  animated: Edge.Animated,
  temporary: Edge.Temporary,
};

export default function WorkflowPage() {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <div className="border-b bg-gradient-to-r from-green-500/5 to-emerald-500/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">LLM Workflow Visualization</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Interactive visualization of how AI processes sustainability impact queries
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Reset Workflow
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <Canvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          connectionLineComponent={Connection}
        >
          <Controls />
          <Panel position="top-left" className="max-w-xs">
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm mb-2">Workflow Overview</h3>
              <p className="text-xs text-muted-foreground">
                This visualization shows how Large Language Models process sustainability queries
                from user input through to final visualization.
              </p>
              <div className="mt-3 flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Active Flow</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                  <span>Conditional</span>
                </div>
              </div>
            </div>
          </Panel>
        </Canvas>
      </div>
    </div>
  );
}
