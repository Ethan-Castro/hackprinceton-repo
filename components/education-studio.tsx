"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DEFAULT_MODEL } from "@/lib/constants";
import { ModelSelector } from "@/components/model-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BookOpenCheck, Brain, Sparkles, TimerReset } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  TextbookChapter,
  Diagram,
  MindMap,
  Exercise,
  KeyPoints,
  CodeExample,
} from "@/components/ai-elements/textbook";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements";
import {
  ArtifactRenderer,
  WebPreviewRenderer,
  HtmlPreviewRenderer,
} from "@/components/tool-renderers";
import type {
  ArtifactRendererData,
  WebPreviewRendererData,
  HtmlPreviewRendererData,
} from "@/components/tool-renderers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatedLogo } from "@/components/animated-logo";
import type {
  TextbookChapterPayload,
  DiagramPayload,
  MindMapPayload,
  ExercisePayload,
  KeyPointsPayload,
  CodeExamplePayload,
} from "@/types/ai-tool-output";

const learningStyles = [
  { value: "visual", label: "Visual / Spatial" },
  { value: "auditory", label: "Auditory" },
  { value: "kinesthetic", label: "Hands-on" },
  { value: "conceptual", label: "Conceptual" },
];

const gradeLevels = [
  { value: "middle-school", label: "Middle School" },
  { value: "high-school", label: "High School" },
  { value: "college", label: "College" },
  { value: "professional", label: "Professional" },
];

const depthModes = [
  { value: "survey", label: "Survey" },
  { value: "chapter", label: "Full Chapter" },
  { value: "studio", label: "Deep Dive" },
];

type GeneratorForm = {
  topic: string;
  learner: string;
  interest: string;
  goals: string;
  details: string;
  gradeLevel: string;
  learningStyle: string;
  depth: string;
};

const defaultForm: GeneratorForm = {
  topic: "Newton's Third Law",
  learner: "Jordan",
  interest: "basketball",
  goals: "Explain the concept intuitively, connect to daily life, and prepare a quick quiz.",
  details: "Show how the law appears in fast breaks and in art studio setups; include a short mnemonic.",
  gradeLevel: "high-school",
  learningStyle: "visual",
  depth: "chapter",
};

type FeatureKey = "chapter" | "diagram" | "mindmap" | "quiz" | "keyPoints";

const featureChecklist: Array<{ key: FeatureKey; label: string }> = [
  { key: "chapter", label: "Immersive textbook" },
  { key: "diagram", label: "Visual diagram" },
  { key: "mindmap", label: "Mind map" },
  { key: "quiz", label: "Mini quiz" },
  { key: "keyPoints", label: "Key takeaways" },
];

const buildPrompt = (form: GeneratorForm) => {
  return `You are LearnOS, a generative teacher that designs adaptive textbooks.
Learner brief:
- Topic: ${form.topic}
- Learner name: ${form.learner || 'the student'}
- Interest lens: ${form.interest || 'surprise them with a creative hook'}
- Grade level: ${form.gradeLevel}
- Preferred style: ${form.learningStyle}
- Goals: ${form.goals || 'Teach the essentials and check understanding.'}
- Additional context: ${form.details || 'Use your judgement to add delightful context.'}
- Depth target: ${form.depth}

Follow this recipe and rely on the available tools:
1. Rewrite the topic intro through the learner's interest and create a full chapter using the generateTextbookChapter tool. Include at least three sections plus a conclusion, and weave in prompts or reflective questions.
2. Produce a concept visual using generateDiagram. Favor timelines or concept maps that pair text callouts with subtle colors.
3. Build a hierarchical mind map using generateMindMap where each branch references the personalized interest and spans at least two levels of depth.
4. Create a practice burst using generateExercises with 4-6 questions (mix multiple choice, short answer, and estimation). Provide correct answers and short rationales.
5. Summarize the must-remember ideas with generateKeyPoints so the learner has portable notes.
6. If relevant, supply a short runnable or pseudo-code example via generateCodeExample to illustrate mechanisms or calculations.
7. Finish with a conversational paragraph that suggests how the learner could extend or remix the material.

Keep tone encouraging, specific, and rich with visuals whenever possible.`;
};

const hasToolOutput = (messages: ReturnType<typeof useChat>["messages"], tool: string) =>
  messages.some((message) =>
    message.parts?.some(
      (part) => part.type === tool && "state" in part && part.state === "output-available"
    )
  );

export function EducationStudio({ modelId = DEFAULT_MODEL }: { modelId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<GeneratorForm>(defaultForm);
  const [selectedModel, setSelectedModel] = useState(modelId || DEFAULT_MODEL);
  const [formError, setFormError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = useChat({ id: "education-studio" });
  const { messages, status, sendMessage, stop, error, setMessages } = chat;

  const isStreaming = status === "streaming";

  const progress = useMemo<Record<FeatureKey, boolean>>(
    () => ({
      chapter: hasToolOutput(messages, "tool-generateTextbookChapter"),
      diagram: hasToolOutput(messages, "tool-generateDiagram"),
      mindmap: hasToolOutput(messages, "tool-generateMindMap"),
      quiz: hasToolOutput(messages, "tool-generateExercises"),
      keyPoints: hasToolOutput(messages, "tool-generateKeyPoints"),
    }),
    [messages]
  );

  const hasResults = Object.values(progress).some(Boolean);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleModelChange = (newModelId: string) => {
    setSelectedModel(newModelId);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
    params.set("modelId", newModelId);
    const nextQuery = params.toString();
    router.push(nextQuery ? `?${nextQuery}` : "", { scroll: false });
  };

  const handleFieldChange = (
    field: keyof GeneratorForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.topic.trim()) {
      setFormError("Add a topic so we know what to teach.");
      return;
    }
    setFormError(null);
    const prompt = buildPrompt(form);
    stop();
    setMessages([]);
    sendMessage({ text: prompt }, { body: { modelId: selectedModel } });
  };

  const handleReset = () => {
    stop();
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent)]">
      <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4 gap-4">
          <div className="flex items-center gap-3">
            <AnimatedLogo />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Generative Classroom</p>
              <h1 className="text-lg font-semibold">Immersive Education Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/playground" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Open Playground
              </Button>
            </Link>
            <ModelSelector modelId={selectedModel} onModelChange={handleModelChange} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border bg-card/90 shadow-border-medium p-6 space-y-6"
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Learner brief</p>
              <h2 className="text-2xl font-bold leading-tight">
                Personalize the concept before we generate it for you
              </h2>
              <p className="text-sm text-muted-foreground">
                Describe the learner, their interests, and the level of detail you need. The studio will orchestrate a textbook chapter, visual systems, a mind map, and practice activities automatically.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic or standard</label>
                  <Input
                    value={form.topic}
                    onChange={(event) => handleFieldChange("topic", event.target.value)}
                    placeholder="e.g., Newton's Third Law"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learner name</label>
                  <Input
                    value={form.learner}
                    onChange={(event) => handleFieldChange("learner", event.target.value)}
                    placeholder="Add a name or leave blank"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interest lens</label>
                  <Input
                    value={form.interest}
                    onChange={(event) => handleFieldChange("interest", event.target.value)}
                    placeholder="Basketball, art, music..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade band</label>
                  <Select
                    value={form.gradeLevel}
                    onValueChange={(value) => handleFieldChange("gradeLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade band" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning style</label>
                  <Select
                    value={form.learningStyle}
                    onValueChange={(value) => handleFieldChange("learningStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Depth</label>
                  <Select
                    value={form.depth}
                    onValueChange={(value) => handleFieldChange("depth", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                    <SelectContent>
                      {depthModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning goal</label>
                  <Input
                    value={form.goals}
                    onChange={(event) => handleFieldChange("goals", event.target.value)}
                    placeholder="State the desired outcome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional context</label>
                <textarea
                  value={form.details}
                  onChange={(event) => handleFieldChange("details", event.target.value)}
                  className="min-h-[110px] w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Share nuances, misconceptions to address, or assessment needs"
                />
              </div>
            </div>

            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button type="submit" disabled={isStreaming} className="px-6">
                {isStreaming ? "Designing your lesson..." : "Generate learning kit"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={!messages.length || isStreaming}
              >
                Reset workspace
              </Button>
              {isStreaming && (
                <Button type="button" variant="outline" onClick={stop}>
                  Stop generation
                </Button>
              )}
            </div>
          </form>

          <aside className="rounded-3xl border bg-card/50 shadow-border-medium p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                <h3 className="text-xl font-semibold">
                  {isStreaming ? "Crafting resources" : hasResults ? "Ready to review" : "Standing by"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isStreaming ? "Generating personalized content and visual layers" : hasResults ? "Share or export any artifact below" : "Fill the brief and hit generate."}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                {isStreaming ? <TimerReset className="h-6 w-6 animate-spin" /> : <Brain className="h-6 w-6" />}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Delivery checklist</p>
              <div className="space-y-2">
                {featureChecklist.map((feature) => (
                  <div
                    key={feature.key}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-3 py-2",
                      progress[feature.key as keyof typeof progress]
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-muted/40"
                    )}
                  >
                    <span className="text-sm font-medium">{feature.label}</span>
                    {progress[feature.key as keyof typeof progress] ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <BookOpenCheck className="h-5 w-5" />
                <p className="text-sm font-semibold">Export tips</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Every artifact is downloadable as HTML, PDF, or Markdown.</li>
                <li>• Use the mind map to open or collapse branches when presenting.</li>
                <li>• Mini quizzes include answer keys so you can copy into any LMS.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border bg-background/70 shadow-border-medium p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Generated kit</p>
              <h3 className="text-2xl font-semibold">Immersive, multi-format delivery</h3>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {messages
              .filter((message) => message.role === "assistant")
              .map((message) => (
                <div key={message.id} className="rounded-3xl border bg-card shadow-border-medium p-5 space-y-4">
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div key={`${message.id}-${index}`} className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                          </div>
                        );
                      case "reasoning":
                        return (
                          <Reasoning key={`${message.id}-${index}`} className="w-full">
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      case "tool-displayArtifact":
                        if (part.state === "output-available") {
                          return (
                            <ArtifactRenderer
                              key={`${message.id}-${index}`}
                              data={part.output as ArtifactRendererData}
                            />
                          );
                        }
                        break;
                      case "tool-displayWebPreview":
                        if (part.state === "output-available") {
                          return (
                            <WebPreviewRenderer
                              key={`${message.id}-${index}`}
                              data={part.output as WebPreviewRendererData}
                            />
                          );
                        }
                        break;
                      case "tool-generateHtmlPreview":
                        if (part.state === "output-available") {
                          return (
                            <HtmlPreviewRenderer
                              key={`${message.id}-${index}`}
                              data={part.output as HtmlPreviewRendererData}
                            />
                          );
                        }
                        break;
                      case "tool-generateTextbookChapter":
                        if (part.state === "output-available") {
                          return (
                            <TextbookChapter
                              key={`${message.id}-${index}`}
                              {...(part.output as TextbookChapterPayload)}
                            />
                          );
                        }
                        break;
                      case "tool-generateDiagram":
                        if (part.state === "output-available") {
                          return (
                            <Diagram
                              key={`${message.id}-${index}`}
                              {...(part.output as DiagramPayload)}
                            />
                          );
                        }
                        break;
                      case "tool-generateMindMap":
                        if (part.state === "output-available") {
                          return (
                            <MindMap
                              key={`${message.id}-${index}`}
                              {...(part.output as MindMapPayload)}
                            />
                          );
                        }
                        break;
                      case "tool-generateExercises":
                        if (part.state === "output-available") {
                          return (
                            <Exercise
                              key={`${message.id}-${index}`}
                              {...(part.output as ExercisePayload)}
                            />
                          );
                        }
                        break;
                      case "tool-generateKeyPoints":
                        if (part.state === "output-available") {
                          return (
                            <KeyPoints
                              key={`${message.id}-${index}`}
                              {...(part.output as KeyPointsPayload)}
                            />
                          );
                        }
                        break;
                      case "tool-generateCodeExample":
                        if (part.state === "output-available") {
                          return (
                            <CodeExample
                              key={`${message.id}-${index}`}
                              {...(part.output as CodeExamplePayload)}
                            />
                          );
                        }
                        break;
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}
            {!messages.length && (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Provide a learner brief to see the full experience come to life.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </section>
      </main>
    </div>
  );
}
