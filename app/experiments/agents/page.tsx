"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Bot, 
  PlayCircle, 
  ShieldCheck, 
  Sparkles, 
  Workflow, 
  Terminal, 
  Code2, 
  Cpu,
  Zap,
  Layout
} from "lucide-react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const agentProfiles = [
  {
    title: "Chat Agent",
    status: "Active",
    model: "openai/gpt-4o",
    loop: "stopWhen: stepCountIs(10)",
    description: "General-purpose agent using the Agent class with tool-calling capabilities. Handles displayArtifact, displayWebPreview, and generateHtmlPreview tools.",
    tags: ["Multi-tool", "Streaming", "UI Integration"],
    code: `const agent = new Agent({
  model: 'openai/gpt-4o',
  system: 'You are a helpful assistant.',
  tools: {
    displayArtifact,
    displayWebPreview,
    generateHtmlPreview,
  },
  stopWhen: stepCountIs(10),
});`,
  },
  {
    title: "Research Agent",
    status: "Planned",
    model: "openai/gpt-4o-mini",
    loop: "Parallel processing",
    description: "Demonstrates parallel workflow pattern - executes multiple independent searches simultaneously and synthesizes results.",
    tags: ["Parallel", "Synthesis", "Citations"],
    code: `const results = await Promise.all([
  searchTool({ query: 'topic A' }),
  searchTool({ query: 'topic B' }),
]);

const summary = await generateText({
  model,
  prompt: \`Synthesize: \${JSON.stringify(results)}\`,
});`,
  },
  {
    title: "Evaluation Agent",
    status: "Planned",
    model: "openai/gpt-4o",
    loop: "Evaluator-Optimizer",
    description: "Implements feedback loop pattern - evaluates outputs, provides scores, and iterates until quality thresholds are met.",
    tags: ["QA", "Feedback", "Guardrails"],
    code: `while (iterations < MAX_ITERATIONS) {
  const evaluation = await evaluateTool({
    content: currentOutput
  });

  if (evaluation.score >= threshold) break;

  currentOutput = await improveTool({
    content: currentOutput,
    feedback: evaluation.suggestions
  });
}`,
  },
];

const pipeline = [
  {
    title: "LLM Processing",
    state: "Active",
    detail: "Agent class processes input and decides next action - either generates text (completes) or calls a tool (continues loop).",
    icon: Bot,
  },
  {
    title: "Tool Execution",
    state: "Active",
    detail: "When model calls a tool, AI SDK executes it and returns results. Supports displayArtifact, displayWebPreview, and generateHtmlPreview.",
    icon: Terminal,
  },
  {
    title: "Loop Control",
    state: "Active",
    detail: "stopWhen conditions determine when to exit: stepCountIs(10) or model generates text instead of calling tools.",
    icon: Cpu,
  },
  {
    title: "Context Management",
    state: "Active",
    detail: "Conversation history maintained across steps. System prompt defines agent behavior and tool usage guidelines.",
    icon: Layout,
  },
];

const workflowPatterns = [
  {
    title: "Sequential Processing",
    detail: "Chain operations in predefined order - each step's output becomes input for the next.",
    pattern: "Chains",
  },
  {
    title: "Parallel Processing",
    detail: "Execute independent subtasks simultaneously. Use Promise.all() to improve efficiency.",
    pattern: "Concurrent",
  },
  {
    title: "Routing",
    detail: "Model decides execution path based on context. Classification determines which model to use.",
    pattern: "Conditional",
  },
  {
    title: "Orchestrator-Worker",
    detail: "Primary model coordinates specialized workers. Orchestrator plans, workers execute subtasks.",
    pattern: "Hierarchical",
  },
  {
    title: "Evaluator-Optimizer",
    detail: "Quality control with feedback loops. Evaluate results, iterate with adjustments.",
    pattern: "Iterative",
  },
];

export default function AgentExperimentsPage() {
  const [prompt, setPrompt] = useState("");
  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    id: "agent-lab-chat",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isRunning = status === "streaming" || status === "submitted";

  const renderPart = (part: any, key: string) => {
    // Handle text parts
    if (part?.type === "text") {
      return (
        <p key={key} className="leading-relaxed text-sm whitespace-pre-wrap text-foreground/90">
          {part.text}
        </p>
      );
    }

    // Handle reasoning parts (for reasoning models)
    if (part?.type === "reasoning") {
      return (
        <details key={key} className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-xs border border-blue-100 dark:border-blue-900/50">
          <summary className="cursor-pointer font-medium text-blue-700 dark:text-blue-400 mb-2 hover:underline">
            💭 Reasoning Process
          </summary>
          <pre className="text-blue-600 dark:text-blue-300 whitespace-pre-wrap font-mono text-[10px]">
            {part.text}
          </pre>
        </details>
      );
    }

    // Handle step boundaries
    if (part?.type === "step-start") {
      return (
        <div
          key={key}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground my-3 opacity-70"
        >
          <div className="h-px flex-1 bg-border" />
          <span>Step {(part as any).stepNumber || "Next"}</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      );
    }

    // Handle tool invocations
    const partType: string | undefined = part?.type;
    if (partType && partType.startsWith("tool-")) {
      const state = (part as any).state;
      const toolName = partType.replace("tool-", "");

      // Tool input streaming/available
      if (state === "input-streaming" || state === "input-available") {
        return (
          <div key={key} className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-3 my-2">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
              <span className="animate-pulse">⚙️</span>
              <span>Calling: <span className="font-mono">{toolName}</span></span>
            </div>
            <pre className="text-[10px] text-amber-600 dark:text-amber-300 whitespace-pre-wrap font-mono bg-white/50 dark:bg-black/10 p-2 rounded">
              {JSON.stringify((part as any).input ?? {}, null, 2)}
            </pre>
          </div>
        );
      }

      // Tool output available
      if (state === "output-available") {
        return (
          <div key={key} className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-3 my-2">
            <div className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-400 mb-2">
              <span>✓</span>
              <span>Result: <span className="font-mono">{toolName}</span></span>
            </div>
            <pre className="text-[10px] text-green-600 dark:text-green-300 whitespace-pre-wrap break-words font-mono bg-white/50 dark:bg-black/10 p-2 rounded max-h-40 overflow-y-auto">
              {typeof (part as any).output === "string"
                ? (part as any).output
                : JSON.stringify((part as any).output, null, 2)}
            </pre>
          </div>
        );
      }

      // Tool error
      if (state === "output-error") {
        return (
          <div key={key} className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 my-2">
            <div className="flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-400 mb-1">
              <span>✕</span>
              <span>Error: {toolName}</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-300">
              {(part as any).errorText ?? "An error occurred while executing this tool"}
            </p>
          </div>
        );
      }
    }

    // Fallback for unknown part types
    return (
      <details key={key} className="rounded-md bg-muted/40 p-2 text-[11px] my-1">
        <summary className="cursor-pointer text-muted-foreground">Unknown part type: {partType}</summary>
        <pre className="mt-2 text-muted-foreground whitespace-pre-wrap font-mono">
          {JSON.stringify(part, null, 2)}
        </pre>
      </details>
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    await sendMessage({ text: prompt });
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start justify-center space-y-5 sm:space-y-6 pt-8 sm:pt-12 pb-8 sm:pb-12 border-b border-border/40"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
              AI SDK v6
            </Badge>
            <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
              Experiments
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tighter text-foreground">
            Agent <span className="font-serif italic text-muted-foreground">Lab</span>
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl font-light leading-relaxed text-balance">
            Interactive playground for the AI SDK Agent class. Experiment with LLMs that use tools in a loop to accomplish tasks through multi-step reasoning.
          </p>

          <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto justify-center" asChild>
              <Link href="/chat">
                Launch Full Chat <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto justify-center" asChild>
              <Link href="/experiments">
                v0 Clone <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Left Column: Chat & Interactive */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-8 space-y-8"
          >
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Bot className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Interactive Console</h2>
            </div>

            <motion.div variants={item}>
              <Card className="border-none shadow-sm bg-muted/30 overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/5 bg-white/40 dark:bg-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">Agent Session</CardTitle>
                        <CardDescription className="text-xs font-mono">/api/chat • {status ?? "ready"}</CardDescription>
                      </div>
                    </div>
                    {error && (
                      <Badge variant="destructive" className="text-[10px]">Error</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-6 space-y-6 bg-background/50">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 text-muted-foreground">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                          <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium mb-1">Ready to Experiment</p>
                        <p className="text-xs max-w-xs mx-auto mb-6">
                          Start a conversation to observe the agent loop, tool calls, and reasoning steps in real-time.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                          {[
                            "Create a button with hover effects",
                            "Show me a Python fibonacci function",
                            "Generate a responsive card component"
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setPrompt(suggestion)}
                              className="text-xs border rounded-lg p-2 hover:bg-muted transition-colors text-left truncate"
                            >
                              "{suggestion}"
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={message.id}
                          className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                           {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`p-4 rounded-2xl text-sm ${
                                message.role === 'user' 
                                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                  : 'bg-white dark:bg-muted/20 border border-border/50 shadow-sm rounded-tl-none'
                              }`}>
                                <div className="space-y-2">
                                  {message.parts?.map((part: any, index: number) =>
                                    renderPart(part, `${message.id}-${index}`)
                                  )}
                                </div>
                              </div>
                            </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 border-t border-border/5 bg-white/40 dark:bg-black/20">
                  <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                    <Input
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Instruction for the agent..."
                      disabled={isRunning}
                      className="bg-background/80 border-transparent shadow-none focus-visible:ring-1 rounded-full px-4 font-sans h-11"
                    />
                    <div className="flex items-center gap-1">
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!prompt.trim() || isRunning}
                        className="rounded-full h-10 w-10"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      {isRunning && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => stop()}
                          className="rounded-full h-10 w-10"
                        >
                          <span className="h-3 w-3 bg-destructive rounded-sm" />
                        </Button>
                      )}
                      {!isRunning && messages.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerate()}
                          className="rounded-full h-10 w-10"
                        >
                          <Workflow className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Core Concepts */}
            <div className="flex items-center gap-2 border-b pb-4 pt-8 mb-6">
              <Code2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Core Concepts</h2>
            </div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Card className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="mb-2 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Bot className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-medium">LLMs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Process input and decide the next action - generate text to complete, or call a tool to continue.
                    </p>
                  </CardContent>
               </Card>
               <Card className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="mb-2 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-medium">Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Extend capabilities beyond text generation: reading files, calling APIs, writing to databases.
                    </p>
                  </CardContent>
               </Card>
               <Card className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="mb-2 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-medium">Loop</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Orchestrates execution through context management and stopping conditions like stepCountIs.
                    </p>
                  </CardContent>
               </Card>
            </motion.div>

          </motion.div>

          {/* Right Column: Info & Profiles */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-4 space-y-8"
          >
             <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Cpu className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Agent Profiles</h2>
            </div>

            <div className="space-y-4">
              {agentProfiles.map((profile, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="hover:shadow-md transition-all duration-300 border-border/40">
                    <CardHeader className="pb-3 space-y-1">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-base font-medium">{profile.title}</CardTitle>
                         <Badge variant={profile.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                           {profile.status}
                         </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {profile.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-3">
                       <div className="flex flex-wrap gap-2">
                          {profile.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              {tag}
                            </Badge>
                          ))}
                       </div>
                       <details className="group">
                        <summary className="cursor-pointer text-xs font-medium text-primary hover:underline flex items-center gap-1 select-none">
                           <Code2 className="h-3 w-3" /> View Logic
                        </summary>
                        <pre className="mt-2 rounded-md bg-muted p-3 text-[10px] overflow-x-auto font-mono text-muted-foreground">
                          <code>{profile.code}</code>
                        </pre>
                      </details>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

             <div className="flex items-center gap-2 border-b pb-4 pt-4 mb-6">
              <Layout className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Loop Architecture</h2>
            </div>

             <div className="space-y-4">
               {pipeline.map((step, i) => (
                 <motion.div key={i} variants={item}>
                    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                         <step.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{step.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                 </motion.div>
               ))}
             </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}
