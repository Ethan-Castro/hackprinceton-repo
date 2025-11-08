import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_MODEL } from "@/lib/constants";
import { EducationStudio } from "@/components/education-studio";
import { ArrowUpRight, BookOpenCheck, Layers3, Sparkles } from "lucide-react";

const highlightStats = [
  {
    title: "Orchestrated pages",
    value: "6+ outputs",
    description: "Chapters, diagrams, mind maps, code, quizzes, and key points arrive from a single brief.",
  },
  {
    title: "Model ready",
    value: "Multi-provider",
    description: "Swap Anthropic, OpenAI, Cerebras, or custom models with the built-in selector.",
  },
  {
    title: "Theme safe",
    value: "Adaptive UI",
    description: "Reuses the Textbook Studio system so everything feels consistent with the rest of Education.",
  },
];

const buildSteps = [
  {
    title: "1 · Setup",
    description:
      "Start with Next.js, add shadcn/ui plus AI Elements, then pull in the v0 SDK so we can talk to the platform API.",
    code: `npx create-next-app@latest v0-clone && cd v0-clone
npx shadcn@latest init
npx ai-elements@latest
pnpm add v0-sdk`,
    language: "bash",
  },
  {
    title: "2 · Client surface",
    description:
      "Reuse the Conversation, PromptInput, and WebPreview primitives. They give us chat controls, a preview pane, and streaming states out of the box.",
    code: `const handleSendMessage = async (message: PromptInputMessage) => {
  if (!message.text?.trim() || isLoading) return;
  setIsLoading(true);
  const response = await fetch('/api/v0-chat', {
    method: 'POST',
    body: JSON.stringify({ message: message.text, chatId: currentChat?.id }),
  });
  const chat = await response.json();
  setCurrentChat(chat);
  setChatHistory((prev) => [...prev, { type: 'assistant', content: 'Preview ready!' }]);
};`,
    language: "tsx",
  },
  {
    title: "3 · Server glue",
    description:
      "Expose a tiny route handler that proxies each message to v0. The SDK keeps auth, retries, and typing in one place.",
    code: `import { NextResponse } from "next/server";
import { v0 } from "v0-sdk";

export async function POST(request: Request) {
  const { message, chatId } = await request.json();
  const chat = chatId
    ? await v0.chats.sendMessage({ chatId, message })
    : await v0.chats.create({ message });

  return NextResponse.json({ id: chat.id, demo: chat.demo });
}`,
    language: "ts",
  },
];

const resourceGuides = [
  {
    title: "Quickstart",
    source: "https://v0.app/docs/api/platform/quickstart",
    description: "Authenticate with the v0 SDK, embed demos, and fetch generated files in a couple of calls.",
    bullets: [
      "Store `V0_API_KEY` in `.env.local`",
      "Use `v0.chats.create()` for net-new generations",
      "Read `chat.files` when you need code bundles",
    ],
  },
  {
    title: "Platform Overview",
    source: "https://v0.app/docs/api/platform/overview",
    description: "Understand projects, chats, deployments, quotas, and the REST surface.",
    bullets: [
      "Projects group files and chats",
      "Chats stream markdown, code, math, and tasks",
      "Deployments package the latest chat version",
    ],
  },
  {
    title: "Rendering Chat Messages",
    source: "https://v0.app/docs/api/platform/guides/displaying-chat-messages",
    description: "Use `@v0-sdk/react` for markdown, math, thinking sections, and streaming payloads.",
    bullets: [
      "Parse `MessageBinaryFormat` from `chat.messages`",
      "Customize `Message` with your own `CodeBlock` + `MathPart`",
      "Swap to `StreamingMessage` for live updates",
    ],
  },
  {
    title: "AI Tools Example",
    source: "https://v0.app/docs/api/platform/examples/ai-tools",
    description: "Wire the v0 toolset into AI SDK workflows, chaining project, chat, and deployment steps.",
    bullets: [
      "Import `v0Tools` and selectively expose categories",
      "Use `stopWhen(stepCountIs(n))` to cap agents",
      "Log tool usage for cost awareness",
    ],
  },
  {
    title: "React Components Example",
    source: "https://v0.app/docs/api/platform/examples/react-components",
    description: "Explore premade themes, streaming shells, and task visualizers built with Next.js 15.",
    bullets: [
      "Elegant, Minimal, Neobrutalism, Terminal, Streaming themes",
      "Built with Tailwind + Framer Motion",
      "Drop-in `<StreamingMessage />` blocks",
    ],
  },
];

const ecosystemTiles = [
  {
    title: "MCP Server",
    description: "Pipe v0 into Cursor, Claude Desktop, or any MCP-ready IDE by pointing `mcp-remote` at `https://mcp.v0.dev`.",
    link: "https://v0.app/docs/api/platform/adapters/mcp-server",
  },
  {
    title: "AI Tools Adapter",
    description: "Bundle v0 primitives as functions for the AI SDK, LangChain, or OpenAI function calling.",
    link: "https://v0.app/docs/api/platform/adapters/ai-tools",
  },
  {
    title: "v0 SDK",
    description: "Type-safe client covering projects, chats, deployments, and billing—no manual fetches required.",
    link: "https://v0.app/docs/api/platform/packages/v0-sdk",
  },
  {
    title: "create-v0-sdk-app",
    description: "Scaffold a v0 clone, classic workflow, or AI tools demo with one command.",
    link: "https://v0.app/docs/api/platform/packages/create-v0-sdk-app",
  },
];

type CodeSampleProps = {
  code: string;
  language: string;
};

function CodeSample({ code, language }: CodeSampleProps) {
  return (
    <pre className="mt-4 rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed shadow-inner border border-border overflow-x-auto">
      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{language}</div>
      <code>{code}</code>
    </pre>
  );
}

export const metadata = {
  title: "Textbook Studio · v0 Clone",
  description: "Interactive example that pairs the Education Textbook Studio with the v0 Platform tutorial.",
};

export default async function V0ExamplePage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string }>;
}) {
  const params = await searchParams;
  const modelId = params?.modelId ?? DEFAULT_MODEL;

  return (
    <div className="space-y-12 pb-16">
      <section className="border-b bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
          <Badge className="w-fit gap-2 px-3 py-1 text-xs">
            <BookOpenCheck className="h-3.5 w-3.5" />
            Education · Textbook Studio
          </Badge>
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                v0 clone · multi-page textbook generator
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Bring the official v0 workflow into Education. Prompt once, orchestrate an entire chapter, and keep
                students inside a cohesive studio experience. This page doubles as the tutorial + working demo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link href="#studio">
                    Launch generator
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="https://v0.app/docs/api/platform" target="_blank" rel="noreferrer">
                    Platform docs
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="gap-2">
                  <Link href="/education">
                    Back to Textbook Studio
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/30 bg-card/40 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">Why this example?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  The Textbook Studio already knows how to call our education tools. By pairing it with the v0 clone
                  tutorial we get a consistent UI, better onboarding, and a live playground in one tab.
                </p>
                <Separator />
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Layers3 className="mt-0.5 h-4 w-4 text-primary" />
                    Multi-output orchestration handled by the studio.
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    Tutorial content stays in sync with actual components.
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-primary" />
                    Reuse it under /examples/v0, but link back to /education.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {highlightStats.map((stat) => (
              <Card key={stat.title} className="bg-card/70">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="studio" className="space-y-6 mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live Generator</p>
            <h2 className="text-2xl font-semibold leading-tight">Textbook Studio, powered by v0</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Personalize a brief, press generate, and capture chapters, diagrams, practice, and mind maps in one sweep.
              You can switch models, reset runs, and export anything the studio produces.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/education">
              Open stand-alone view
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-[32px] border shadow-xl overflow-hidden">
          <EducationStudio modelId={modelId} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Build it yourself</p>
          <h2 className="text-2xl font-semibold">From project init to deployed demo</h2>
          <p className="text-sm text-muted-foreground">
            The steps below condense the full instructions you shared—use them as a checklist while you wire up your own
            clone.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {buildSteps.map((step) => (
            <Card key={step.title} className="flex flex-col bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CodeSample code={step.code} language={step.language} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Resource library</p>
          <h2 className="text-2xl font-semibold">Docs that pair perfectly with the studio</h2>
          <p className="text-sm text-muted-foreground">
            Each card is distilled from the material in your brief—skim here, then dive into the source when you need the
            fine print.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {resourceGuides.map((guide) => (
            <Card key={guide.title} className="bg-card/60">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-base">{guide.title}</CardTitle>
                  <Button asChild size="sm" variant="ghost" className="gap-1 text-xs">
                    <Link href={guide.source} target="_blank" rel="noreferrer">
                      Read
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {guide.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ecosystem</p>
          <h2 className="text-2xl font-semibold">Extend the example</h2>
          <p className="text-sm text-muted-foreground">
            Hook MCP servers into your IDE, hand tools to agents, or bootstrap an entire project from a template.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {ecosystemTiles.map((tile) => (
            <Card key={tile.title} className="bg-card/60">
              <CardHeader>
                <CardTitle className="text-base">{tile.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{tile.description}</p>
                <Button asChild variant="ghost" className="gap-2">
                  <Link href={tile.link} target="_blank" rel="noreferrer">
                    Visit documentation
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
