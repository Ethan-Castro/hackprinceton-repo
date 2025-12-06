"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SendIcon, PlusIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DEFAULT_MODEL } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceInput } from "@/components/voice-input";
import { TextToSpeechButton } from "@/components/text-to-speech-button";
import { Toaster } from "react-hot-toast";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  Context,
  ContextContent,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextTrigger,
  DynamicTemplateDocument,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Response,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  TemplateDocumentSkeleton,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements";
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
import { ChartRenderer } from "@/components/chart-renderer";
import { PythonOutputRenderer } from "@/components/python-output-renderer";
import { SQLResultsRenderer } from "@/components/sql-results-renderer";
import { DiagramRenderer } from "@/components/diagram-renderer";
import {
  SearchResultsRenderer,
  FirecrawlResultsRenderer,
  ParallelAgentResultsRenderer,
} from "@/components/search-results-renderer";
import type {
  TextbookChapterPayload,
  ExercisePayload,
  DiagramPayload,
  CodeExamplePayload,
  KeyPointsPayload,
  MindMapPayload,
  CaseStudyPayload,
  TemplateDocumentPayload,
} from "@/types/ai-tool-output";
import {
  extractSourcesFromParts,
  formatToolOutput,
  getPartText,
  mapToolState,
  parseChainOfThoughtPart,
  type MessagePart,
} from "@/lib/ai-elements-helpers";
import type { ChartToolOutput } from "@/lib/chart-tools";
import type { SearchToolOutput } from "@/lib/exa-search-tools";
import type { FirecrawlToolOutput } from "@/lib/firecrawl-tools";
import type { ParallelAgentOutput } from "@/lib/parallel-ai-tools";
import type { PythonToolOutput } from "@/lib/python-tools";
import type { SqlToolOutput } from "@/lib/sql-tools";
import type { CanvasToolOutput } from "@/lib/canvas-tools";
import type { DisplayModel } from "@/lib/display-model";
import { useModelManager } from "@/lib/hooks/use-model-manager";
import { ProvidersWarning } from "@/components/providers-warning";

function ModelSelectorHandler({
  modelId,
  onModelIdChange,
  models,
  modelsLoading,
  modelsError,
}: {
  modelId: string;
  onModelIdChange: (newModelId: string) => void;
  models: DisplayModel[];
  modelsLoading: boolean;
  modelsError: Error | null;
}) {
  const router = useRouter();

  const handleSelectChange = (newModelId: string) => {
    onModelIdChange(newModelId);
    const params = new URLSearchParams();
    params.set("modelId", newModelId);
    router.push(`?${params.toString()}`);
  };

  return (
    <ModelSelector
      modelId={modelId}
      onModelChange={handleSelectChange}
      models={models}
      isLoading={modelsLoading}
      error={modelsError}
    />
  );
}

export function Chat({
  modelId = DEFAULT_MODEL,
  apiEndpoint = "/api/chat",
  embedded = false,
  extraBody,
  onToolCall
}: {
  modelId?: string;
  apiEndpoint?: string;
  embedded?: boolean;
  extraBody?: Record<string, any>;
  onToolCall?: (toolName: string, args: any, result: any) => void;
}) {
  const [input, setInput] = useState("");
  const [currentApiEndpoint, setCurrentApiEndpoint] = useState(apiEndpoint);
  const {
    currentModelId,
    setCurrentModelId,
    models,
    modelsLoading,
    modelsError,
    providers,
  } = useModelManager(modelId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const lastApiEndpointRef = useRef(apiEndpoint);
  const [tokenUsage, setTokenUsage] = useState({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
  });

  const { messages, error, sendMessage, regenerate, setMessages, stop, status } = useChat({
    api: currentApiEndpoint,
    id: `chat-${currentApiEndpoint}`,
    onFinish: (message: any) => {
        // Inspect message for tool calls to notify parent
        if (onToolCall && message.parts) {
            message.parts.forEach((part: any) => {
                if (part.type === "tool-invocation" && part.toolInvocation) {
                   const invocation = part.toolInvocation;
                   if (invocation.state === 'result') {
                       onToolCall(invocation.toolName, invocation.args, invocation.result);
                   }
                }
            });
        }
    },
    body: {
      enableAllTools: true,  // Enable all 40+ tools including Valyu search suite
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  // Hook into messages to detect completed tool calls in real-time (streaming updates)
  useEffect(() => {
    if (!onToolCall || !messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return;

    lastMessage.parts.forEach((part: any) => {
       // Depending on AI SDK version, part structure varies. 
       // We look for tool parts with output/result available.
       // The 'tool-generateHtmlPreview' case below handles rendering,
       // but we want to lift the data up.
       
       // Check for our specific tool types mapped in the switch below
       if (part.type === 'tool-generateHtmlPreview' && part.state === 'output-available') {
           // Use a ref or check to avoid duplicate calls if necessary, 
           // but for now, firing the callback with latest data is okay (parent should handle diffing)
           onToolCall('generateHtmlPreview', part.args || {}, part.output);
       }
    });
  }, [messages, onToolCall]);

  useEffect(() => {
    if (lastApiEndpointRef.current === apiEndpoint) {
      return;
    }

    lastApiEndpointRef.current = apiEndpoint;
    stop();
    setMessages([]);
    setInput("");
    setCurrentApiEndpoint(apiEndpoint);
  }, [apiEndpoint, setMessages, stop]);

  const hasMessages = messages.length > 0;
  const modelsUnavailable = !modelsLoading && models.length === 0;
  const containerClass = cn(
    "flex flex-col relative transition-all duration-500",
    embedded ? "min-h-[720px] bg-background" : (hasMessages ? "h-screen overflow-hidden" : "min-h-screen overflow-y-auto bg-background")
  );

  const [shouldAutoscroll, setShouldAutoscroll] = useState(true);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      setShouldAutoscroll(distanceFromBottom < 160);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMessages]);

  useEffect(() => {
    if (!shouldAutoscroll) {
      return;
    }

    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
    }

    scrollAnimationFrameRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: status === "streaming" ? "auto" : "smooth",
      });
    });

    return () => {
      if (scrollAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
        scrollAnimationFrameRef.current = null;
      }
    };
  }, [messages, status, shouldAutoscroll]);

  useEffect(() => {
    const averageCharsPerToken = 4;

    const sumCharsForRole = (role: "user" | "assistant") =>
      messages
        .filter((message) => message.role === role)
        .reduce((total, message) => {
          const partChars = (message.parts ?? []).reduce((count, messagePart) => {
            const partRecord = messagePart as MessagePart;
            const text = getPartText(partRecord);
            if (text) {
              return count + text.length;
            }

            if ("output" in partRecord && typeof partRecord.output === "string") {
              return count + partRecord.output.length;
            }

            if ("args" in partRecord) {
              try {
                return count + JSON.stringify(partRecord.args).length;
              } catch {
                return count;
              }
            }

            return count;
          }, 0);

          return total + partChars;
        }, 0);

    const inputTokens = Math.ceil(sumCharsForRole("user") / averageCharsPerToken);
    const outputTokens = Math.ceil(sumCharsForRole("assistant") / averageCharsPerToken);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = Number(((inputTokens * 0.0005) + (outputTokens * 0.0015)).toFixed(4));

    setTokenUsage({
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
    });
  }, [messages]);

  const handleNewChat = () => {
    stop();
    setMessages([]);
    setInput("");
    setShouldAutoscroll(true);
  };

  const renderTokenUsage = () => {
    if (tokenUsage.totalTokens <= 0) {
      return null;
    }

    const maxTokens = 4000;

    return (
      <Context
        maxTokens={maxTokens}
        usedTokens={tokenUsage.totalTokens}
        modelId={currentModelId}
      >
        <ContextTrigger className="h-8 px-3 text-xs font-medium">
          Tokens: {tokenUsage.totalTokens}
        </ContextTrigger>
        <ContextContent className="space-y-4">
          <ContextContentHeader />
          <div className="space-y-2">
            <ContextInputUsage>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Input</span>
                <span className="font-medium">{tokenUsage.inputTokens}</span>
              </div>
            </ContextInputUsage>
            <ContextOutputUsage>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Output</span>
                <span className="font-medium">{tokenUsage.outputTokens}</span>
              </div>
            </ContextOutputUsage>
          </div>
          <ContextContentFooter>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated Cost</span>
              <span className="font-semibold">
                ${tokenUsage.estimatedCost.toFixed(4)}
              </span>
            </div>
          </ContextContentFooter>
        </ContextContent>
      </Context>
    );
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className={containerClass}>
        {hasMessages && (
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
        )}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 animate-fade-in">
            <div className="w-full max-w-2xl text-center space-y-8 md:space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-8xl font-light tracking-tighter text-foreground">
                  Augment <span className="font-serif italic text-muted-foreground">Intelligence</span>
                </h1>
              </motion.div>
              
              <ProvidersWarning providers={providers} />
              
              <div className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage({ text: input }, { body: { modelId: currentModelId, ...extraBody } });
                    setInput("");
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl glass-effect shadow-border-medium transition-all duration-200 ease-out bg-muted/30 border border-muted-foreground/10">
                    <div className="flex items-center gap-2">
                      <ModelSelectorHandler
                        modelId={currentModelId}
                        onModelIdChange={setCurrentModelId}
                        models={models}
                        modelsLoading={modelsLoading}
                        modelsError={modelsError}
                      />
                      {renderTokenUsage()}
                    </div>
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
                              { body: { modelId: currentModelId, ...extraBody } },
                            );
                            setInput("");
                          }
                        }}
                        disabled={modelsUnavailable}
                      />
                      <VoiceInput
                        onTranscript={(text) => setInput(text)}
                        disabled={status === "streaming" || modelsUnavailable}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all duration-150"
                        disabled={!input.trim() || modelsUnavailable}
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
            <ProvidersWarning providers={providers} className="mb-4" />
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 md:px-8 py-4 hide-scrollbar"
            >
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
                      const partKey = `${m.id}-${i}`;
                      const partType = part.type as string;
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const anyPart = part as any;
                      switch (partType) {
                        case "text": {
                          const textContent = getPartText(part as MessagePart);

                          if (!textContent) {
                            return null;
                          }

                          return (
                            <div key={partKey} className="group relative">
                              <Response>{textContent}</Response>
                              {m.role === "assistant" && (
                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <TextToSpeechButton text={textContent} />
                                </div>
                              )}
                            </div>
                          );
                        }

                        case "chain-of-thought": {
                          const firstChainIndex = m.parts.findIndex(
                            (chainPart) => (chainPart.type as string) === "chain-of-thought"
                          );

                          if (i !== firstChainIndex) {
                            return null;
                          }

                          const chainData = parseChainOfThoughtPart(part as MessagePart);

                          if (!chainData) {
                            return null;
                          }

                          const isLatestAssistantMessage =
                            status === "streaming" &&
                            i === m.parts.length - 1 &&
                            m.id === messages.at(-1)?.id;

                          return (
                            <ChainOfThought
                              key={partKey}
                              className="my-4"
                              defaultOpen={isLatestAssistantMessage}
                            >
                              <ChainOfThoughtHeader>
                                {chainData.title ?? "Chain of Thought"}
                              </ChainOfThoughtHeader>
                              <ChainOfThoughtContent>
                                {chainData.steps.length > 0 ? (
                                  chainData.steps.map((step, stepIndex) => (
                                    <ChainOfThoughtStep
                                      key={`${partKey}-step-${stepIndex}`}
                                      label={step.label}
                                      description={step.description}
                                      status={step.status}
                                    />
                                  ))
                                ) : chainData.text ? (
                                  <Response className="text-sm">
                                    {chainData.text}
                                  </Response>
                                ) : null}

                                {chainData.searchResults.length > 0 && (
                                  <ChainOfThoughtSearchResults>
                                    {chainData.searchResults.map((result, resultIndex) => (
                                      <ChainOfThoughtSearchResult
                                        key={`${partKey}-result-${resultIndex}`}
                                      >
                                        {result}
                                      </ChainOfThoughtSearchResult>
                                    ))}
                                  </ChainOfThoughtSearchResults>
                                )}
                              </ChainOfThoughtContent>
                            </ChainOfThought>
                          );
                        }

                        case "source":
                        case "source-url": {
                          const firstSourceIndex = m.parts.findIndex(
                            (sourcePart) =>
                              (sourcePart.type as string) === "source-url" ||
                              (sourcePart.type as string) === "source"
                          );

                          if (i !== firstSourceIndex) {
                            return null;
                          }

                          const sources = extractSourcesFromParts(
                            (m.parts ?? []) as MessagePart[]
                          );

                          if (sources.length === 0) {
                            return null;
                          }

                          return (
                            <Sources key={partKey} className="my-2">
                              <SourcesTrigger count={sources.length} />
                              <SourcesContent>
                                {sources.map((source, sourceIndex) => (
                                  <Source
                                    key={`${partKey}-source-${sourceIndex}`}
                                    href={source.url}
                                    title={source.description ?? source.title ?? source.url}
                                  >
                                    {source.title ?? source.url}
                                  </Source>
                                ))}
                              </SourcesContent>
                            </Sources>
                          );
                        }

                        case "reasoning":
                          return (
                            <Reasoning
                              key={partKey}
                              className="w-full mb-4"
                              isStreaming={
                                status === "streaming" &&
                                i === m.parts.length - 1 &&
                                m.id === messages.at(-1)?.id
                              }
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>
                                {typeof anyPart.text === "string" ? (
                                  <Response>{anyPart.text}</Response>
                                ) : (
                                  anyPart.text
                                )}
                              </ReasoningContent>
                            </Reasoning>
                          );

                        case "tool-displayArtifact":
                          if (anyPart.state === "output-available") {
                            return (
                              <ArtifactRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as {
                                  title?: string;
                                  description?: string;
                                  content: string;
                                  contentType: "code" | "text" | "markdown" | "html";
                                  language?: string;
                                }}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating artifact...
                              </div>
                            );
                          }
                          break;

                        case "tool-displayWebPreview":
                          if (anyPart.state === "output-available") {
                            return (
                              <WebPreviewRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as {
                                  url: string;
                                  title?: string;
                                  description?: string;
                                }}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Loading preview...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateChart":
                          if (anyPart.state === "output-available") {
                            return (
                              <ChartRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as ChartToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating chart...
                              </div>
                            );
                          }
                          break;

                        case "tool-webSearch":
                          if (anyPart.state === "output-available") {
                            return (
                              <SearchResultsRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as SearchToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Searching the web...
                              </div>
                            );
                          }
                          break;

                        case "tool-scrapeWebsite":
                          if (anyPart.state === "output-available") {
                            return (
                              <FirecrawlResultsRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as FirecrawlToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Scraping website...
                              </div>
                            );
                          }
                          break;

                        case "tool-runParallelAgent":
                          if (anyPart.state === "output-available") {
                            return (
                              <ParallelAgentResultsRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as ParallelAgentOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Running parallel agent...
                              </div>
                            );
                          }
                          break;

                        case "tool-executePython":
                          if (anyPart.state === "output-available") {
                            return (
                              <PythonOutputRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as PythonToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Executing Python code...
                              </div>
                            );
                          }
                          break;

                        case "tool-analyzeDataset":
                          if (anyPart.state === "output-available") {
                            return (
                              <PythonOutputRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as PythonToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Analyzing dataset...
                              </div>
                            );
                          }
                          break;

                        case "tool-executeSQL":
                          if (anyPart.state === "output-available") {
                            return (
                              <SQLResultsRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as SqlToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Executing SQL query...
                              </div>
                            );
                          }
                          break;

                        case "tool-describeTable":
                          if (anyPart.state === "output-available") {
                            return (
                              <SQLResultsRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as SqlToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Describing table...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateMermaidDiagram":
                          if (anyPart.state === "output-available") {
                            return (
                              <DiagramRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as CanvasToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating diagram...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateMermaidFlowchart":
                          if (anyPart.state === "output-available") {
                            return (
                              <DiagramRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as CanvasToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating flowchart...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateMermaidERDiagram":
                          if (anyPart.state === "output-available") {
                            return (
                              <DiagramRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as CanvasToolOutput}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating ER diagram...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateHtmlPreview":
                          if (anyPart.state === "output-available") {
                            return (
                              <HtmlPreviewRenderer
                                key={`${m.id}-${i}`}
                                data={anyPart.output as {
                                  html: string;
                                  dataUrl?: string;
                                  title?: string;
                                  description?: string;
                                }}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating HTML preview...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateTextbookChapter":
                          if (anyPart.state === "output-available") {
                            return (
                              <TextbookChapter
                                key={`${m.id}-${i}`}
                                {...(anyPart.output as TextbookChapterPayload)}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating textbook chapter...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateExercises":
                          if (anyPart.state === "output-available") {
                            return (
                              <Exercise
                                key={`${m.id}-${i}`}
                                {...(anyPart.output as ExercisePayload)}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating exercises...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateDiagram":
                          if (anyPart.state === "output-available") {
                            return (
                              <Diagram
                                key={`${m.id}-${i}`}
                                {...(anyPart.output as DiagramPayload)}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating diagram...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateCodeExample":
                          if (anyPart.state === "output-available") {
                            return (
                              <CodeExample
                                key={`${m.id}-${i}`}
                                {...(anyPart.output as CodeExamplePayload)}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating code example...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateKeyPoints":
                          if (anyPart.state === "output-available") {
                            return (
                              <KeyPoints
                                key={`${m.id}-${i}`}
                                {...(anyPart.output as KeyPointsPayload)}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating key points...
                              </div>
                            );
                          }
                          break;

                        case "tool-generateCaseStudy":
                          if (anyPart.state === "output-available") {
                            const data = anyPart.output as CaseStudyPayload;
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
                          } else if (anyPart.state === "input-available") {
                            return (
                              <div key={`${m.id}-${i}`} className="text-muted-foreground text-sm">
                                Generating case study...
                              </div>
                            );
                          }
                          break;
                        case "tool-renderTemplateDocument":
                          if (anyPart.state === "output-available") {
                            return (
                              <DynamicTemplateDocument
                                key={`${m.id}-${i}`}
                                template={anyPart.output as TemplateDocumentPayload}
                                isStreaming={
                                  status === "streaming" &&
                                  i === m.parts.length - 1 &&
                                  m.id === messages.at(-1)?.id
                                }
                              />
                            );
                          } else if (anyPart.state === "input-available") {
                            return (
                              <TemplateDocumentSkeleton key={`${m.id}-${i}`} />
                            );
                          }
                          break;

                        case "tool-generateMindMap":
                          if (anyPart.state === "output-available") {
                            return (
                              <MindMap
                                key={`${m.id}-${i}`}
                                {...(anyPart.output as MindMapPayload)}
                              />
                            );
                          } else if (anyPart.state === "input-available") {
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

                        default:
                          // Handle any tool calls that don't have specific renderers
                          if (partType.startsWith("tool-") && "state" in anyPart) {
                            const toolState = mapToolState(anyPart.state as string);
                            const toolInput =
                              "args" in anyPart && typeof anyPart.args === "object"
                                ? (anyPart.args as Record<string, unknown>)
                                : "input" in anyPart && typeof anyPart.input === "object"
                                ? (anyPart.input as Record<string, unknown>)
                                : undefined;
                            const toolOutput = "output" in anyPart ? anyPart.output : undefined;
                            const toolError =
                              "errorText" in anyPart && typeof anyPart.errorText === "string"
                                ? anyPart.errorText
                                : undefined;

                            return (
                              <Tool
                                key={partKey}
                                className="my-4"
                                defaultOpen={
                                  toolState === "output-available" || toolState === "output-error"
                                }
                              >
                                <ToolHeader type={partType as any} state={toolState} />
                                <ToolContent>
                                  <ToolInput input={toolInput} />
                                  <ToolOutput
                                    output={formatToolOutput(toolOutput)}
                                    errorText={toolError}
                                  />
                                </ToolContent>
                              </Tool>
                            );
                          }
                          return null;
                      }
                    })}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="w-full max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage({ text: input }, { body: { modelId: currentModelId, ...extraBody } });
                setInput("");
              }}
              className="px-4 md:px-8 pb-6 md:pb-8"
            >
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl glass-effect shadow-border-medium transition-all duration-200 ease-out">
                <div className="flex items-center gap-2">
                  <ModelSelectorHandler
                    modelId={currentModelId}
                    onModelIdChange={setCurrentModelId}
                    models={models}
                    modelsLoading={modelsLoading}
                    modelsError={modelsError}
                  />
                  {renderTokenUsage()}
                </div>
                <div className="flex flex-1 items-center">
                  <Input
                    name="prompt"
                    placeholder="Ask a question..."
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    autoFocus
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50 font-medium transition-all duration-150"
                    onKeyDown={(e) => {
                      if (e.metaKey && e.key === "Enter") {
                        sendMessage(
                          { text: input },
                          { body: { modelId: currentModelId, ...extraBody } },
                        );
                        setInput("");
                      }
                    }}
                    disabled={modelsUnavailable}
                  />
                  <VoiceInput
                    onTranscript={(text) => setInput(text)}
                    disabled={status === "streaming" || modelsUnavailable}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl hover:bg-accent hover:text-accent-foreground hover:scale-110 transition-all duration-150 ease disabled:opacity-50 disabled:hover:scale-100"
                    disabled={!input.trim() || modelsUnavailable}
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  );
}
