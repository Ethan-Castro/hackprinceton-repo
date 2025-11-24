"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, PlayCircle, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const agentProfiles = [
  {
    title: "Gateway Orchestrator",
    status: "Ready",
    model: "openai/gpt-4o",
    loop: "stopWhen: 12 steps",
    description: "Routes prompts through the tool loop, balancing latency and cost while keeping approvals in the path.",
    tags: ["Routing", "Tool loop", "Latency-aware"],
  },
  {
    title: "Research Agent",
    status: "Active",
    model: "openai/gpt-4o-mini",
    loop: "Parallel search + summarize",
    description: "Multi-hop research assistant that fans out to retrieval tools and returns citations for downstream use.",
    tags: ["Retrieval", "Synthesis", "Citations"],
  },
  {
    title: "Evaluation Agent",
    status: "In Progress",
    model: "openai/o4-mini",
    loop: "Evaluator/optimizer",
    description: "Adds a feedback pass to tighten responses, score quality, and retry when guardrails fail.",
    tags: ["QA", "Feedback", "Guardrails"],
  },
];

const pipeline = [
  {
    title: "Context Manager",
    state: "Configured",
    detail: "Normalizes instructions, trims history, and injects shared system defaults before each loop.",
  },
  {
    title: "Tool Execution",
    state: "Live",
    detail: "AI SDK 6 Agent class with tool approval hooks and step caps for multi-call workflows.",
  },
  {
    title: "Output Layer",
    state: "Planned",
    detail: "Structured output for downstream services and UI components that expect typed responses.",
  },
];

const backlog = [
  {
    title: "Reranking + RAG",
    detail: "Wire in rerankers to re-order retrieved docs before the agent summarizes.",
  },
  {
    title: "Human-in-the-loop",
    detail: "Surface approval requests in UI and auto-resume after decisions are made.",
  },
  {
    title: "Benchmark harness",
    detail: "Track latency and quality deltas per model/provider for every experiment run.",
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
    if (part?.type === "text") {
      return (
        <p key={key} className="leading-relaxed text-sm">
          {part.text}
        </p>
      );
    }

    if (part?.type === "reasoning") {
      return (
        <pre
          key={key}
          className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground"
        >
          {part.text}
        </pre>
      );
    }

    if (part?.type === "step-start") {
      return (
        <div
          key={key}
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          —— Next Step ——
        </div>
      );
    }

    const partType: string | undefined = part?.type;

    if (partType && partType.startsWith("tool-")) {
      const state = (part as any).state;
      const toolName = partType.replace("tool-", "");

      if (state === "input-streaming" || state === "input-available") {
        return (
          <div key={key} className="text-xs text-muted-foreground">
            {toolName}: preparing {JSON.stringify((part as any).input ?? {})}
          </div>
        );
      }

      if (state === "output-available") {
        return (
          <div key={key} className="rounded-md border bg-muted/30 p-2 text-xs">
            <div className="font-mono text-[11px] uppercase text-muted-foreground">
              tool · {toolName}
            </div>
            <pre className="whitespace-pre-wrap break-words text-muted-foreground">
              {typeof (part as any).output === "string"
                ? (part as any).output
                : JSON.stringify((part as any).output, null, 2)}
            </pre>
          </div>
        );
      }

      if (state === "output-error") {
        return (
          <div key={key} className="text-xs text-destructive">
            {toolName}: {(part as any).errorText ?? "Tool error"}
          </div>
        );
      }
    }

    return (
      <pre
        key={key}
        className="rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground"
      >
        {JSON.stringify(part, null, 2)}
      </pre>
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    await sendMessage({ text: prompt });
    setPrompt("");
  };

  return (
    <div className="px-4 py-8 md:px-10 lg:px-12 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Experiments</Badge>
            <Badge variant="outline" className="text-xs">
              Agents
            </Badge>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Agent Lab</h1>
            <p className="text-muted-foreground max-w-3xl">
              Start staging multi-tool agents. Track loop configs, approvals, and output modes while we iterate on the Agent class.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/chat">
              Launch Chat
              <PlayCircle className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/experiments">
              v0 Clone
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">useChat</Badge>
              <Badge variant={isRunning ? "secondary" : "outline"} className="uppercase">
                {status ?? "ready"}
              </Badge>
            </div>
            <CardTitle>Live Agent Loop</CardTitle>
            <CardDescription>
              Streaming chat wired to <code className="font-mono text-xs">/api/chat</code> using the AI SDK hook, ready for tool calls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="text-sm text-destructive">
                Something went wrong. Try again or switch models.
              </div>
            )}
            <div className="rounded-2xl border bg-muted/20 p-4 max-h-[420px] overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  Start a thread to see streamed messages, tool calls, and step boundaries.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="space-y-1 rounded-lg border border-dashed border-muted-foreground/20 bg-background/40 p-3"
                  >
                    <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                      {message.role}
                    </div>
                    <div className="space-y-2">
                      {message.parts?.map((part: any, index: number) =>
                        renderPart(part, `${message.id}-${index}`)
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask an agent to run tools, explain a pipeline, or inspect a request..."
                disabled={isRunning}
              />
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button type="submit" disabled={!prompt.trim() || isRunning}>
                  Send
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isRunning}
                  onClick={() => stop()}
                >
                  Stop
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={messages.length === 0 || !(status === "ready" || status === "error")}
                  onClick={() => regenerate()}
                >
                  Regenerate
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hook Playbook</CardTitle>
            <CardDescription>Key pieces pulled from the useChat guide.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-[10px]">Streaming</Badge>
              <p>Messages stream live; status flips between <span className="font-mono">submitted</span>, <span className="font-mono">streaming</span>, and <span className="font-mono">ready</span>.</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-[10px]">Tools</Badge>
              <p>Tool calls render inline from <span className="font-mono">parts</span>; add approvals or client-side outputs via <span className="font-mono">addToolOutput</span>.</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-[10px]">Control</Badge>
              <p>Use <span className="font-mono">stop()</span> to abort a stream and <span className="font-mono">regenerate()</span> to re-run the last assistant turn.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {agentProfiles.map((profile) => (
          <Card key={profile.title} className="h-full">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <CardTitle>{profile.title}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {profile.status}
                </Badge>
              </div>
              <CardDescription>{profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{profile.model}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Workflow className="h-4 w-4" />
                <span>{profile.loop}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end text-xs text-muted-foreground">
              Draft ready for tool approvals
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle>Loop + Guardrails</CardTitle>
            </div>
            <CardDescription>
              The control plane for how we run the Agent class: what context to load, when to approve tools, and how to return outputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map((step, index) => (
              <div key={step.title} className="rounded-xl border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">Step {index + 1}</div>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                  <Badge variant="secondary" className="self-start text-xs">
                    {step.state}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backlog</CardTitle>
            <CardDescription>Next agents to wire up as the SDK 6 work lands.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {backlog.map((item) => (
              <div key={item.title} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    In queue
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
