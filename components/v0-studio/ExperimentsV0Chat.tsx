"use client";

import { useState, useRef } from "react";
import { Sparkles, Check, Rocket, RefreshCw, AlertCircle, ExternalLink, ChevronLeft, ChevronRight, Maximize2, X, Monitor, Smartphone, Link2 } from "lucide-react";
import { AppCustomizationForm, type ModelSpeed } from "./AppCustomizationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ai-elements/loader";

interface PreviewEntry {
  id: string;
  status: "loading" | "success" | "error";
  previewUrl?: string;
  deploymentUrl?: string;
  generatedCode?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are an expert React developer specializing in Tailwind CSS. You are running in an experimental "v0 clone" environment.
      
Your goal is to generate high-quality, responsive, and interactive UI components.
- Use React functional components
- Use Tailwind CSS for styling
- Use Lucide React for icons
- Ensure code is clean and production-ready
- If requested, use Framer Motion for animations

Always return the full code for the component.`;

export function ExperimentsV0Chat() {
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelSpeed>("fast");
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const getCurrentPreview = () => {
    if (previews.length === 0) return null;
    return {
      preview: previews[currentPreviewIndex % previews.length],
      originalIndex: currentPreviewIndex % previews.length,
    };
  };

  const navigatePrev = () => {
    setCurrentPreviewIndex((prev) => (prev - 1 + previews.length) % previews.length);
  };

  const navigateNext = () => {
    setCurrentPreviewIndex((prev) => (prev + 1) % previews.length);
  };

  const generatePreviews = async (prompt: string, model: ModelSpeed) => {
    setIsGenerating(true);
    setSelectedPreviewId(null);
    
    const initialPreviews: PreviewEntry[] = [
      { id: "preview-1", status: "loading" },
      { id: "preview-2", status: "loading" },
      { id: "preview-3", status: "loading" },
    ];
    setPreviews(initialPreviews);

    const modelId = model === "fast" ? "cerebras/zai-glm-4.6" : "google/gemini-3-pro";

    const requests = initialPreviews.map(async (entry) => {
      try {
        const response = await fetch("/api/v0-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            modelId,
            system: SYSTEM_PROMPT,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || "Failed to generate");
        }

        const data = await response.json();
        
        let previewUrl = data.deployment?.webUrl || data.demo || null;
        let generatedCode = null;
        
        if (data.files && data.files.length > 0) {
          const mainFile = data.files.find((f: any) => 
            f.name?.includes('App') || f.name?.includes('page') || f.name?.includes('index')
          ) || data.files[0];
          generatedCode = mainFile?.content || null;
        }

        return {
          id: entry.id,
          status: "success" as const,
          previewUrl,
          deploymentUrl: data.deployment?.webUrl || null,
          generatedCode,
        };
      } catch (err: any) {
        return {
          id: entry.id,
          status: "error" as const,
          error: err.message || "Generation failed",
        };
      }
    });

    const results = await Promise.allSettled(requests);
    
    const updatedPreviews = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        id: initialPreviews[index].id,
        status: "error" as const,
        error: "Request failed",
      };
    });

    setPreviews(updatedPreviews);
    setIsGenerating(false);
  };

  const handleFormSubmit = (prompt: string, model: ModelSpeed) => {
    setInitialPrompt(prompt);
    setSelectedModel(model);
    generatePreviews(prompt, model);
  };

  const handleRetry = () => {
    if (initialPrompt) {
      generatePreviews(initialPrompt, selectedModel);
    }
  };

  const handleDeploy = () => {
    const selected = previews.find(p => p.id === selectedPreviewId);
    if (selected?.deploymentUrl) {
      window.open(selected.deploymentUrl, "_blank");
    } else if (selected?.previewUrl) {
      window.open(selected.previewUrl, "_blank");
    }
  };

  const handleNewSession = () => {
    setInitialPrompt(null);
    setPreviews([]);
    setSelectedPreviewId(null);
    setIsGenerating(false);
  };

  if (!initialPrompt) {
    return (
      <AppCustomizationForm 
        onSubmit={handleFormSubmit}
        title="Build UI Component"
        description="Create React components with Tailwind CSS. We'll generate 3 variations for you to choose from."
        domain="UI component"
        purposePlaceholder="e.g. Landing Page, Dashboard, Form"
        freeformPlaceholder="Describe the component or UI you want to build..."
        themeOptions={[
          { value: "light", label: "Light / Clean" },
          { value: "dark", label: "Dark / Modern" },
          { value: "gradient", label: "Gradient / Creative" },
          { value: "minimal", label: "Minimal / Sleek" },
        ]}
      />
    );
  }

  const expandedPreview = previews.find(p => p.id === expandedPreviewId);
  const successfulPreviews = previews.filter(p => p.status === "success");
  const allLoading = previews.every(p => p.status === "loading");
  const allFailed = previews.length > 0 && previews.every(p => p.status === "error");

  if (expandedPreviewId && expandedPreview) {
    const expandedIndex = previews.findIndex(p => p.id === expandedPreviewId);
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between border-b bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Option {expandedIndex + 1}</h1>
              <p className="text-sm text-muted-foreground">Expanded Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewportMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewportMode("desktop")}
                className="h-8 px-3"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={viewportMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewportMode("mobile")}
                className="h-8 px-3"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
            
            <Button
              variant={selectedPreviewId === expandedPreviewId ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPreviewId(expandedPreviewId)}
              className={cn(
                selectedPreviewId === expandedPreviewId && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              <Check className="h-4 w-4 mr-2" />
              {selectedPreviewId === expandedPreviewId ? "Selected" : "Select This"}
            </Button>
            
            {expandedPreview.previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(expandedPreview.previewUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedPreviewId(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-muted/30 flex items-center justify-center p-6 overflow-hidden">
          <div 
            className={cn(
              "bg-background rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-full",
              viewportMode === "desktop" ? "w-full max-w-6xl" : "w-[375px]"
            )}
            style={{
              maxHeight: viewportMode === "mobile" ? "812px" : "100%",
            }}
          >
            {expandedPreview.status === "loading" && (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader />
                <p className="text-sm text-muted-foreground">Generating preview...</p>
              </div>
            )}
            {expandedPreview.status === "error" && (
              <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive text-center">{expandedPreview.error}</p>
              </div>
            )}
            {expandedPreview.status === "success" && expandedPreview.previewUrl && (
              <iframe
                src={expandedPreview.previewUrl}
                className="w-full h-full border-0"
                title={`Preview ${expandedIndex + 1}`}
              />
            )}
            {expandedPreview.status === "success" && !expandedPreview.previewUrl && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No preview available</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-background px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={expandedIndex === 0}
              onClick={() => setExpandedPreviewId(previews[expandedIndex - 1]?.id || null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex gap-2">
              {previews.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setExpandedPreviewId(p.id)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    expandedPreviewId === p.id 
                      ? "bg-purple-500 scale-125" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={expandedIndex === previews.length - 1}
              onClick={() => setExpandedPreviewId(previews[expandedIndex + 1]?.id || null)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="flex items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">v0 Builder</h1>
            <p className="text-sm text-muted-foreground">Choose from 3 generated variations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewSession}>
            New Session
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const selected = previews.find(p => p.id === selectedPreviewId);
              if (selected?.previewUrl) {
                navigator.clipboard.writeText(selected.previewUrl);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }
            }}
            disabled={!selectedPreviewId || !previews.find(p => p.id === selectedPreviewId)?.previewUrl}
          >
            {linkCopied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-purple-500" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Share Link
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={!selectedPreviewId || deploying}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Deploy Selected
          </Button>
        </div>
      </div>

      <div className="px-6 py-3 border-b bg-muted/30">
        <p className="text-sm">
          <span className="font-medium text-muted-foreground">Your prompt:</span>{" "}
          <span className="text-foreground">{initialPrompt}</span>
        </p>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        {allFailed && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All generations failed. Please try again.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Generation
            </Button>
          </div>
        )}

        {!allFailed && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 pb-4">
              <p className="text-sm text-muted-foreground">Click a preview to select it</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isGenerating}
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                Regenerate All
              </Button>
            </div>

            <div className="relative flex-1 flex items-center min-h-0">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/90 shadow-lg hover:bg-background border"
                onClick={navigatePrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div
                ref={feedRef}
                className="flex-1 flex flex-col px-16 py-4 h-full"
              >
                <div className="flex items-center justify-center gap-3 pb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Option {(currentPreviewIndex % previews.length) + 1} of {previews.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {previews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPreviewIndex(i)}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all",
                          currentPreviewIndex % previews.length === i
                            ? "bg-purple-500 scale-125"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {getCurrentPreview() && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`pair-${getCurrentPreview()!.preview.id}-${currentPreviewIndex}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex gap-6 min-h-0"
                    >
                      <div className="flex-[2] min-w-0">
                        <div
                          className={cn(
                            "h-full flex flex-col cursor-pointer transition-all duration-200 overflow-hidden rounded-xl border bg-card",
                            selectedPreviewId === getCurrentPreview()!.preview.id
                              ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
                              : "hover:shadow-md",
                            getCurrentPreview()!.preview.status === "error" && "opacity-60"
                          )}
                          onClick={() => getCurrentPreview()!.preview.status === "success" && setSelectedPreviewId(getCurrentPreview()!.preview.id)}
                        >
                          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Desktop</span>
                              {getCurrentPreview()!.preview.status === "success" && selectedPreviewId === getCurrentPreview()!.preview.id && (
                                <Badge className="bg-purple-500 text-white text-xs px-2 py-0">
                                  <Check className="mr-1 h-3 w-3" />
                                  Selected
                                </Badge>
                              )}
                              {getCurrentPreview()!.preview.status === "loading" && (
                                <Badge variant="secondary" className="text-xs">Generating...</Badge>
                              )}
                              {getCurrentPreview()!.preview.status === "error" && (
                                <Badge variant="destructive" className="text-xs">Failed</Badge>
                              )}
                            </div>
                            {getCurrentPreview()!.preview.status === "success" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  title="Expand preview"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedPreviewId(getCurrentPreview()!.preview.id);
                                    setViewportMode("desktop");
                                  }}
                                >
                                  <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                                {getCurrentPreview()!.preview.previewUrl && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    title="Open in new tab"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(getCurrentPreview()!.preview.previewUrl, "_blank");
                                    }}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 bg-white dark:bg-slate-900">
                            {getCurrentPreview()!.preview.status === "loading" && (
                              <div className="h-full flex flex-col items-center justify-center gap-3">
                                <Loader />
                                <p className="text-sm text-muted-foreground">Generating...</p>
                              </div>
                            )}
                            {getCurrentPreview()!.preview.status === "error" && (
                              <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                                <p className="text-xs text-destructive text-center">{getCurrentPreview()!.preview.error}</p>
                              </div>
                            )}
                            {getCurrentPreview()!.preview.status === "success" && getCurrentPreview()!.preview.previewUrl && (
                              <iframe
                                src={getCurrentPreview()!.preview.previewUrl}
                                className="w-full h-full border-0"
                                title={`Preview ${getCurrentPreview()!.originalIndex + 1} Desktop`}
                              />
                            )}
                            {getCurrentPreview()!.preview.status === "success" && !getCurrentPreview()!.preview.previewUrl && (
                              <div className="h-full flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">No preview</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-[375px] flex-shrink-0">
                        <div
                          className={cn(
                            "h-full flex flex-col cursor-pointer transition-all duration-200 overflow-hidden rounded-xl border bg-card",
                            selectedPreviewId === getCurrentPreview()!.preview.id
                              ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
                              : "hover:shadow-md",
                            getCurrentPreview()!.preview.status === "error" && "opacity-60"
                          )}
                          onClick={() => getCurrentPreview()!.preview.status === "success" && setSelectedPreviewId(getCurrentPreview()!.preview.id)}
                        >
                          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Mobile</span>
                            </div>
                            {getCurrentPreview()!.preview.status === "success" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Expand preview"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPreviewId(getCurrentPreview()!.preview.id);
                                  setViewportMode("mobile");
                                }}
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex-1 bg-white dark:bg-slate-900">
                            {getCurrentPreview()!.preview.status === "loading" && (
                              <div className="h-full flex items-center justify-center">
                                <Loader />
                              </div>
                            )}
                            {getCurrentPreview()!.preview.status === "error" && (
                              <div className="h-full flex items-center justify-center p-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              </div>
                            )}
                            {getCurrentPreview()!.preview.status === "success" && getCurrentPreview()!.preview.previewUrl && (
                              <iframe
                                src={getCurrentPreview()!.preview.previewUrl}
                                className="w-full h-full border-0"
                                title={`Preview ${getCurrentPreview()!.originalIndex + 1} Mobile`}
                              />
                            )}
                            {getCurrentPreview()!.preview.status === "success" && !getCurrentPreview()!.preview.previewUrl && (
                              <div className="h-full flex items-center justify-center">
                                <p className="text-xs text-muted-foreground">No preview</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/90 shadow-lg hover:bg-background border"
                onClick={navigateNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center">
              {allLoading ? (
                <p className="text-sm text-muted-foreground">Generating 3 variations...</p>
              ) : successfulPreviews.length > 0 && selectedPreviewId ? (
                <p className="text-sm text-muted-foreground">
                  Selected: Option {previews.findIndex(p => p.id === selectedPreviewId) + 1}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
