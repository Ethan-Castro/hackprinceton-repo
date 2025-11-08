"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/model-selector";
import { CategorySelector } from "@/components/category-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SendIcon, PlusIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { DEFAULT_MODEL } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements";
import {
  TextbookChapter,
  Exercise,
  KeyPoints,
  Diagram,
  CodeExample,
  MindMap,
} from "@/components/ai-elements/textbook";
import {
  ArtifactRenderer,
  WebPreviewRenderer,
  HtmlPreviewRenderer,
} from "@/components/tool-renderers";
import { AnimatedLogo } from "@/components/animated-logo";
import type {
  TextbookChapterPayload,
  ExercisePayload,
  DiagramPayload,
  CodeExamplePayload,
  KeyPointsPayload,
  MindMapPayload,
  CaseStudyPayload,
} from "@/types/ai-tool-output";

function ModelSelectorHandler({
  modelId,
  onModelIdChange,
}: {
  modelId: string;
  onModelIdChange: (newModelId: string) => void;
}) {
  const router = useRouter();

  const handleSelectChange = (newModelId: string) => {
    onModelIdChange(newModelId);
    const params = new URLSearchParams();
    params.set("modelId", newModelId);
    router.push(`?${params.toString()}`);
  };

  return <ModelSelector modelId={modelId} onModelChange={handleSelectChange} />;
}

export function Chat({
  modelId = DEFAULT_MODEL,
  apiEndpoint = "/api/chat"
}: {
  modelId: string;
  apiEndpoint?: string;
}) {
  const [input, setInput] = useState("");
  const [currentModelId, setCurrentModelId] = useState(modelId);
  const [category, setCategory] = useState("edu");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleModelIdChange = (newModelId: string) => {
    setCurrentModelId(newModelId);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const { messages, error, sendMessage, regenerate, setMessages, stop, status } = useChat({
    api: apiEndpoint,
  } as any);

  const hasMessages = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    stop();
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex gap-2 animate-fade-in">
        <Button
          onClick={handleNewChat}
          variant="outline"
          size="icon"
          className="h-9 w-9 shadow-border-small hover:shadow-border-medium bg-background/80 backdrop-blur-sm border-0 hover:bg-background hover:scale-[1.02] transition-all duration-150 ease"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
      {!hasMessages && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 animate-fade-in">
          <div className="w-full max-w-2xl text-center space-y-8 md:space-y-12">
            <div className="animate-slide-up">
              <AnimatedLogo />
            </div>
            <div className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage({ text: input }, { body: { modelId: currentModelId } });
                  setInput("");
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl glass-effect shadow-border-medium transition-all duration-200 ease-out">
                  <ModelSelectorHandler
                    modelId={modelId}
                    onModelIdChange={handleModelIdChange}
                  />
                  <CategorySelector
                    category={category}
                    onCategoryChange={handleCategoryChange}
                  />
                  <div className="flex flex-1 items-center">
                    <Input
                      name="prompt"
                      placeholder="Ask a question..."
                      onChange={(e) => setInput(e.target.value)}
                      value={input}
                      autoFocus
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50 transition-all duration-150"
                      onKeyDown={(e) => {
                        if (e.metaKey && e.key === "Enter") {
                          sendMessage(
                            { text: input },
                            { body: { modelId: currentModelId } },
                          );
                          setInput("");
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all duration-150"
                      disabled={!input.trim()}
                    >
                      <SendIcon className="h-4 w-4 transition-transform duration-150 hover:scale-110" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {hasMessages && (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fade-in overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 hide-scrollbar">
            <div className="flex flex-col gap-4 md:gap-6 pb-4">
              {messages.map((m, messageIndex) => (
                <div
                  key={`${m.id}-${messageIndex}`}
                  className={cn(
                    "whitespace-pre-wrap transition-all duration-200 ease-out",
                    m.role === "user" &&
                      "bg-accent text-foreground rounded-2xl p-3 md:p-4 ml-auto max-w-[90%] md:max-w-[75%] shadow-border-medium font-medium text-sm md:text-base border border-border",
                    m.role === "assistant" && "max-w-full text-foreground leading-relaxed text-sm md:text-base space-y-4"
                  )}
                >
                  {m.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div key={`${m.id}-${i}`} className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        );
                      
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${m.id}-${i}`}
                            className="w-full mb-4"
                            isStreaming={status === 'streaming' && i === m.parts.length - 1 && m.id === messages.at(-1)?.id}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      
                      case "tool-displayArtifact":
                        if (part.state === "output-available") {
                          return (
                            <ArtifactRenderer
                              key={`${m.id}-${i}`}
                              data={part.output as {
                                title?: string;
                                description?: string;
                                content: string;
                                contentType: "code" | "text" | "markdown" | "html";
                                language?: string;
                              }}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating artifact...
                            </div>
                          );
                        }
                        break;

                      case "tool-displayWebPreview":
                        if (part.state === "output-available") {
                          return (
                            <WebPreviewRenderer
                              key={`${m.id}-${i}`}
                              data={part.output as {
                                url: string;
                                title?: string;
                                description?: string;
                              }}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Loading preview...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateHtmlPreview":
                        if (part.state === "output-available") {
                          return (
                            <HtmlPreviewRenderer
                              key={`${m.id}-${i}`}
                              data={part.output as {
                                html: string;
                                dataUrl: string;
                                title?: string;
                                description?: string;
                              }}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating HTML preview...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateTextbookChapter":
                        if (part.state === "output-available") {
                          return (
                            <TextbookChapter
                              key={`${m.id}-${i}`}
                              {...(part.output as TextbookChapterPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating textbook chapter...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateExercises":
                        if (part.state === "output-available") {
                          return (
                            <Exercise
                              key={`${m.id}-${i}`}
                              {...(part.output as ExercisePayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating exercises...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateDiagram":
                        if (part.state === "output-available") {
                          return (
                            <Diagram
                              key={`${m.id}-${i}`}
                              {...(part.output as DiagramPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating diagram...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateCodeExample":
                        if (part.state === "output-available") {
                          return (
                            <CodeExample
                              key={`${m.id}-${i}`}
                              {...(part.output as CodeExamplePayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating code example...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateKeyPoints":
                        if (part.state === "output-available") {
                          return (
                            <KeyPoints
                              key={`${m.id}-${i}`}
                              {...(part.output as KeyPointsPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating key points...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateCaseStudy":
                        if (part.state === "output-available") {
                          const data = part.output as CaseStudyPayload;
                          return (
                            <div
                              key={`${m.id}-${i}`}
                              className="flex flex-col rounded-2xl border bg-card shadow-border-medium overflow-hidden p-6 space-y-4"
                            >
                              <h3 className="text-2xl font-bold">{data.title}</h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
                                    Context
                                  </h4>
                                  <p className="text-base">{data.context}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
                                    Scenario
                                  </h4>
                                  <p className="text-base">{data.scenario}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
                                    Analysis
                                  </h4>
                                  <p className="text-base">{data.analysis}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
                                    Outcome
                                  </h4>
                                  <p className="text-base">{data.outcome}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
                                    Key Takeaways
                                  </h4>
                                  <ul className="list-disc list-inside space-y-1">
                                    {data.takeaways.map((takeaway, idx) => (
                                      <li key={idx} className="text-base">
                                        {takeaway}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating case study...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateMindMap":
                        if (part.state === "output-available") {
                          return (
                            <MindMap
                              key={`${m.id}-${i}`}
                              {...(part.output as MindMapPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                              Generating mind map...
                            </div>
                          );
                        }
                        break;

                      case "tool-error":
                        return (
                          <Alert key={`${m.id}-${i}`} variant="destructive" className="my-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Tool Error:</strong> {"errorText" in part ? part.errorText : "An error occurred while executing the tool"}
                            </AlertDescription>
                          </Alert>
                        );
                    }
                  })}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 pb-4 animate-slide-down">
          <Alert variant="destructive" className="flex flex-col items-end">
            <div className="flex flex-row gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <AlertDescription className="dark:text-red-400 text-red-600">
                {error.message.startsWith("AI Gateway requires a valid credit card") ? <div>AI Gateway requires a valid credit card on file to service requests. Please visit your <Link className="underline underline-offset-4" href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card" target="_noblank">dashboard</Link> to add a card and unlock your free credits.</div> : "An error occurred while generating the response."}
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto transition-all duration-150 ease-out hover:scale-105"
              onClick={() => regenerate()}
            >
              Retry
            </Button>
          </Alert>
        </div>
      )}

      {hasMessages && (
        <div className="w-full max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input }, { body: { modelId: currentModelId } });
              setInput("");
            }}
            className="px-4 md:px-8 pb-6 md:pb-8"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl glass-effect shadow-border-medium transition-all duration-200 ease-out">
              <ModelSelectorHandler
                modelId={modelId}
                onModelIdChange={handleModelIdChange}
              />
              <CategorySelector
                category={category}
                onCategoryChange={handleCategoryChange}
              />
              <div className="flex flex-1 items-center">
                <Input
                  name="prompt"
                  placeholder="Ask a question..."
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50 font-medium transition-all duration-150"
                  onKeyDown={(e) => {
                    if (e.metaKey && e.key === "Enter") {
                      sendMessage(
                        { text: input },
                        { body: { modelId: currentModelId } },
                      );
                      setInput("");
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl hover:bg-accent hover:text-accent-foreground hover:scale-110 transition-all duration-150 ease disabled:opacity-50 disabled:hover:scale-100"
                  disabled={!input.trim()}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      <footer className="pb-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        <p className="text-xs md:text-sm text-muted-foreground/80">
          The models in the list are a small subset of those available in the
          Vercel AI Gateway.
          <br />
          See the{" "}
          <Button
            variant="link"
            asChild
            className="p-0 h-auto text-xs md:text-sm font-normal transition-opacity duration-150 hover:opacity-80"
          >
            <a
              href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fmodel-list&title="
              target="_blank"
              rel="noopener noreferrer"
            >
              model library
            </a>
          </Button>{" "}
          for the full set.
        </p>
      </footer>
    </div>
  );
}
