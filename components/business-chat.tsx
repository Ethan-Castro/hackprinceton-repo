"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SendIcon, PlusIcon, Briefcase } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { DEFAULT_MODEL } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BusinessPlan,
  FinancialDashboard,
  SWOTMatrix,
  BusinessModelCanvas,
  PitchDeck,
  MarketAnalysis,
  CompetitorTable,
  FinancialProjections,
} from "@/components/ai-elements/business";
import type {
  BusinessPlanPayload,
  FinancialProjectionsPayload,
  SWOTMatrixPayload,
  BusinessModelCanvasPayload,
  MarketAnalysisPayload,
  PitchDeckPayload,
  FinancialDashboardPayload,
  CompetitorTablePayload,
  MarketingPlanPayload,
  RevenueModelPayload,
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
    router.push(`/business?${params.toString()}`);
  };

  return <ModelSelector modelId={modelId} onModelChange={handleSelectChange} />;
}

export function BusinessChat({ modelId = DEFAULT_MODEL }: { modelId: string }) {
  const [input, setInput] = useState("");
  const [currentModelId, setCurrentModelId] = useState(modelId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleModelIdChange = (newModelId: string) => {
    setCurrentModelId(newModelId);
  };

  const { messages, error, sendMessage, regenerate, setMessages, stop, status } = useChat();

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
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex gap-2 animate-fade-in">
        <Button
          onClick={handleNewChat}
          variant="outline"
          size="icon"
          className="h-9 w-9 shadow-lg hover:shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all duration-150"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 shadow-lg hover:shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all duration-150 text-xs font-medium"
          >
            Back to Home
          </Button>
        </Link>
      </div>
      {!hasMessages && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 animate-fade-in">
          <div className="w-full max-w-2xl text-center space-y-8 md:space-y-12">
            <div className="animate-slide-up">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 shadow-lg">
                  <Briefcase className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-slate-900 dark:from-blue-100 dark:to-slate-100 bg-clip-text text-transparent mb-3">
                Business Intelligence
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Strategic planning, market analysis, financial projections, and competitive intelligence
              </p>
            </div>
            <div className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage({ text: input }, { body: { modelId: currentModelId } });
                  setInput("");
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out hover:shadow-xl">
                  <ModelSelectorHandler
                    modelId={modelId}
                    onModelIdChange={handleModelIdChange}
                  />
                  <div className="flex flex-1 items-center">
                    <Input
                      name="prompt"
                      placeholder="Ask about business strategy, markets, finances..."
                      onChange={(e) => setInput(e.target.value)}
                      value={input}
                      autoFocus
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150"
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
                      className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-all duration-150"
                      disabled={!input.trim()}
                    >
                      <SendIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Quick start suggestions */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Create a business plan",
                  "Generate market analysis",
                  "Build a pitch deck",
                  "SWOT analysis",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      sendMessage({ text: suggestion }, { body: { modelId: currentModelId } });
                      setInput("");
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:scale-105 transition-all duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasMessages && (
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full animate-fade-in overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 hide-scrollbar">
            <div className="flex flex-col gap-4 md:gap-6 pb-4">
              {messages.map((m, messageIndex) => (
                <div
                  key={`${m.id}-${messageIndex}`}
                  className={cn(
                    "whitespace-pre-wrap transition-all duration-200 ease-out",
                    m.role === "user" &&
                      "bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-2xl p-3 md:p-4 ml-auto max-w-[90%] md:max-w-[75%] shadow-lg font-medium text-sm md:text-base border border-blue-500",
                    m.role === "assistant" && "max-w-full text-foreground leading-relaxed text-sm md:text-base space-y-4"
                  )}
                >
                  {m.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div key={`${m.id}-${i}`} className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        );

                      // Business tool renderers
                      case "tool-generateBusinessPlan":
                        if (part.state === "output-available") {
                          return (
                            <BusinessPlan
                              key={`${m.id}-${i}`}
                              {...(part.output as BusinessPlanPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              Generating comprehensive business plan...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateFinancialProjections":
                        if (part.state === "output-available") {
                          return (
                            <FinancialProjections
                              key={`${m.id}-${i}`}
                              {...(part.output as FinancialProjectionsPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                              Calculating financial projections...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateSWOTAnalysis":
                        if (part.state === "output-available") {
                          return (
                            <SWOTMatrix
                              key={`${m.id}-${i}`}
                              {...(part.output as SWOTMatrixPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full"></div>
                              Analyzing strengths, weaknesses, opportunities, and threats...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateBusinessModelCanvas":
                        if (part.state === "output-available") {
                          return (
                            <BusinessModelCanvas
                              key={`${m.id}-${i}`}
                              {...(part.output as BusinessModelCanvasPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              Creating business model canvas...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateMarketAnalysis":
                        if (part.state === "output-available") {
                          return (
                            <MarketAnalysis
                              key={`${m.id}-${i}`}
                              {...(part.output as MarketAnalysisPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                              Conducting market analysis...
                            </div>
                          );
                        }
                        break;

                      case "tool-generatePitchDeck":
                        if (part.state === "output-available") {
                          return (
                            <PitchDeck
                              key={`${m.id}-${i}`}
                              {...(part.output as PitchDeckPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              Creating pitch deck presentation...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateFinancialDashboard":
                        if (part.state === "output-available") {
                          return (
                            <FinancialDashboard
                              key={`${m.id}-${i}`}
                              {...(part.output as FinancialDashboardPayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              Building financial dashboard...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateMarketingPlan":
                        if (part.state === "output-available") {
                          const data = part.output as MarketingPlanPayload;
                          return (
                            <div
                              key={`${m.id}-${i}`}
                              className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
                            >
                              <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
                                <h3 className="text-2xl font-bold text-white mb-1">{data.title}</h3>
                                <p className="text-purple-100 text-sm">Marketing Strategy & Execution</p>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">Positioning</h4>
                                  <p className="text-slate-700 dark:text-slate-300">{data.positioning}</p>
                                </div>
                                {data.targetAudience && data.targetAudience.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">Target Audience</h4>
                                    <div className="space-y-3">
                                      {data.targetAudience.map((audience, idx: number) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                          <p className="font-semibold text-slate-900 dark:text-slate-100">{audience.segment}</p>
                                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{audience.description}</p>
                                          {audience.size && <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Size: {audience.size}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {data.channels && data.channels.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">Marketing Channels</h4>
                                    <div className="space-y-3">
                                      {data.channels.map((channel, idx: number) => (
                                        <div key={idx} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                          <p className="font-semibold text-blue-900 dark:text-blue-100">{channel.name}</p>
                                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{channel.strategy}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                              Developing marketing plan...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateCompetitorAnalysis":
                        if (part.state === "output-available") {
                          return (
                            <CompetitorTable
                              key={`${m.id}-${i}`}
                              {...(part.output as CompetitorTablePayload)}
                            />
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                              Analyzing competitive landscape...
                            </div>
                          );
                        }
                        break;

                      case "tool-generateRevenueModel":
                        if (part.state === "output-available") {
                          const data = part.output as RevenueModelPayload;
                          return (
                            <div
                              key={`${m.id}-${i}`}
                              className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
                            >
                              <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-6">
                                <h3 className="text-2xl font-bold text-white mb-1">{data.title}</h3>
                                <p className="text-green-100 text-sm">Revenue & Monetization Strategy</p>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">Monetization Strategy</h4>
                                  <p className="text-slate-700 dark:text-slate-300">{data.monetizationStrategy}</p>
                                </div>
                                {data.revenueStreams && data.revenueStreams.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">Revenue Streams</h4>
                                    <div className="space-y-4">
                                      {data.revenueStreams.map((stream, idx: number) => (
                                        <div key={idx} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                          <p className="font-bold text-green-900 dark:text-green-100">{stream.name}</p>
                                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{stream.description}</p>
                                          <p className="text-xs text-green-700 dark:text-green-300 mt-2">Model: {stream.pricingModel}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {data.unitEconomics && (
                                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Unit Economics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {data.unitEconomics.cac && (
                                        <div>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">CAC</p>
                                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{data.unitEconomics.cac}</p>
                                        </div>
                                      )}
                                      {data.unitEconomics.ltv && (
                                        <div>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">LTV</p>
                                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{data.unitEconomics.ltv}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } else if (part.state === "input-available") {
                          return (
                            <div key={`${m.id}-${i}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                              Designing revenue model...
                            </div>
                          );
                        }
                        break;

                      case "tool-error":
                        return (
                          <Alert key={`${m.id}-${i}`} variant="destructive" className="my-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Error:</strong> {"errorText" in part ? part.errorText : "An error occurred while executing the tool"}
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
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pb-4 animate-slide-down">
          <Alert variant="destructive" className="flex flex-col items-end">
            <div className="flex flex-row gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <AlertDescription className="dark:text-red-400 text-red-600">
                {error.message.startsWith("AI Gateway requires a valid credit card") ? (
                  <div>
                    AI Gateway requires a valid credit card on file to service requests. Please visit your{" "}
                    <Link className="underline underline-offset-4" href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card" target="_blank">
                      dashboard
                    </Link>{" "}
                    to add a card and unlock your free credits.
                  </div>
                ) : (
                  "An error occurred while generating the response."
                )}
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
        <div className="w-full max-w-6xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input }, { body: { modelId: currentModelId } });
              setInput("");
            }}
            className="px-4 md:px-8 pb-6 md:pb-8"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out hover:shadow-xl">
              <ModelSelectorHandler
                modelId={modelId}
                onModelIdChange={handleModelIdChange}
              />
              <div className="flex flex-1 items-center">
                <Input
                  name="prompt"
                  placeholder="Ask about business strategy, markets, finances..."
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium transition-all duration-150"
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
                  className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-all duration-150"
                  disabled={!input.trim() || status === "streaming"}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
