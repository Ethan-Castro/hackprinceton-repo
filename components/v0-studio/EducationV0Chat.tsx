"use client";

import { useState, useRef } from "react";
import { GraduationCap, Check, Rocket, RefreshCw, AlertCircle, ExternalLink, ChevronLeft, ChevronRight, Maximize2, X, Monitor, Smartphone, Link2, Download } from "lucide-react";
import { AppCustomizationForm, type ModelSpeed, type ImageData } from "./AppCustomizationForm";
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

const SYSTEM_PROMPT = `You are an elite educational technology developer. Create engaging, interactive learning experiences that make students excited to learn and teachers proud to use.

USER VISION FIRST:
- Elementary school = different from university = different from corporate training
- Match their subject, age group, and teaching style
- Math app looks different from language learning from art tutorials
- If they mention a brand aesthetic or colors, use THOSE

EDUCATION UX PRINCIPLES:
- Fun but focused: vibrant colors without being distracting
- Clear learning pathways with visible progress
- Immediate feedback on interactions (right/wrong, progress updates)
- Encouraging tone: celebrate successes, gently guide through mistakes
- Accessibility: works for all learners, clear fonts, good contrast

MUST-HAVE ELEMENTS:
- Progress indicators (stars, badges, completion bars)
- Interactive quiz elements with instant feedback
- Clear section headers with learning objectives
- Visual representations of concepts (diagrams, illustrations)
- Call-to-action buttons that encourage next steps

EDUCATION-SPECIFIC PATTERNS:
- Quiz cards: question, multiple choice options, submit button, feedback state
- Progress tracker: current lesson, completed lessons, remaining lessons
- Flashcards: front/back with flip interaction
- Lesson cards: thumbnail, title, duration, difficulty badge
- Achievement badges: icon, title, description, earned state

EXAMPLE - Interactive Quiz Card:
\`\`\`jsx
export default function QuizCard() {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const correctAnswer = 2;
  const options = ['Photosynthesis', 'Respiration', 'Mitosis', 'Osmosis'];

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6 max-w-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">Question 3 of 10</span>
        <div className="flex-1 bg-slate-100 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full" style={{width: '30%'}}></div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">What process do plants use to convert sunlight into energy?</h3>
      <div className="space-y-2 mb-4">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelected(i)}
            className={\`w-full text-left p-3 rounded-lg border-2 transition-all \${
              submitted
                ? i === correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : selected === i
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200'
                : selected === i
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'
            }\`}
          >
            {option}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selected === null}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div className={\`p-3 rounded-lg \${selected === correctAnswer ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}\`}>
          {selected === correctAnswer ? '🎉 Correct! Great job!' : '💡 Not quite. The answer is Photosynthesis.'}
        </div>
      )}
    </div>
  );
}
\`\`\`

COLOR PALETTE FOR EDUCATION:
- Primary: indigo-500/600 or violet-500/600 (engaging, scholarly)
- Success: green-500 (correct answers, completed)
- Incorrect: rose-500 (wrong answers, needs review)
- Highlight: amber-400 (stars, achievements)
- Background: slate-50, white (clean, focused)
- Fun accents: sky, purple, pink for gamification elements

GAMIFICATION ELEMENTS:
- Stars (⭐) for achievements
- Streaks for consecutive correct answers
- XP or points system
- Level indicators
- Celebration animations (confetti, checkmarks)

The user will describe what educational tool they need. Create something that makes learning feel like a game kids want to play.`;

export function EducationV0Chat() {
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [initialDisplayPrompt, setInitialDisplayPrompt] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelSpeed>("fast");
  const [initialImages, setInitialImages] = useState<ImageData[] | undefined>(undefined);
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showUserPrompt, setShowUserPrompt] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
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

  const generatePreviews = async (prompt: string, model: ModelSpeed, images?: ImageData[]) => {
    setIsGenerating(true);
    setSelectedPreviewId(null);
    
    const initialPreviews: PreviewEntry[] = [
      { id: "preview-1", status: "loading" },
      { id: "preview-2", status: "loading" },
      { id: "preview-3", status: "loading" },
    ];
    setPreviews(initialPreviews);

    const modelId = model === "fast" ? "cerebras/gpt-oss-120b" : "google/gemini-3-pro";

    const requests = initialPreviews.map(async (entry) => {
      try {
        const response = await fetch("/api/v0-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            modelId,
            system: SYSTEM_PROMPT,
            images: images,
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

  const handleFormSubmit = (prompt: string, model: ModelSpeed, images?: ImageData[], userPrompt?: string) => {
    setInitialPrompt(prompt);
    setInitialDisplayPrompt(userPrompt || prompt);
    setSelectedModel(model);
    setInitialImages(images);
    generatePreviews(prompt, model, images);
  };

  const handleRetry = () => {
    if (initialPrompt) {
      generatePreviews(initialPrompt, selectedModel, initialImages);
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

  const exportCode = (preview?: PreviewEntry) => {
    const previewToExport = preview || previews.find((p) => p.id === selectedPreviewId);
    if (!previewToExport?.generatedCode) return;

    const previewIndex = previews.findIndex((p) => p.id === previewToExport.id);
    const filename = `v0-generation-${previewIndex >= 0 ? previewIndex + 1 : 1}.tsx`;
    const blob = new Blob([previewToExport.generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNewSession = () => {
    setInitialPrompt(null);
    setInitialDisplayPrompt(null);
    setPreviews([]);
    setSelectedPreviewId(null);
    setIsGenerating(false);
  };

  if (!initialPrompt) {
    return (
      <AppCustomizationForm 
        onSubmit={handleFormSubmit}
        title="Build Educational Content"
        description="Create interactive lessons, quizzes, and learning materials. We'll generate 3 variations for you to choose from."
        domain="educational application"
        purposePlaceholder="e.g. Quiz App, Flashcards, Learning Game"
        freeformPlaceholder="Describe the educational content or app you want to build..."
        themeOptions={[
          { value: "light", label: "Light / Friendly" },
          { value: "dark", label: "Dark / Focus Mode" },
          { value: "colorful", label: "Colorful / Kids" },
          { value: "academic", label: "Academic / Professional" },
        ]}
      />
    );
  }

  const expandedPreview = previews.find(p => p.id === expandedPreviewId);
  const successfulPreviews = previews.filter(p => p.status === "success");
  const allLoading = previews.every(p => p.status === "loading");
  const allFailed = previews.length > 0 && previews.every(p => p.status === "error");
  const selectedPreview = selectedPreviewId ? previews.find((p) => p.id === selectedPreviewId) : null;

  if (expandedPreviewId && expandedPreview) {
    const expandedIndex = previews.findIndex(p => p.id === expandedPreviewId);
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between border-b bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                selectedPreviewId === expandedPreviewId && "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              <Check className="h-4 w-4 mr-2" />
              {selectedPreviewId === expandedPreviewId ? "Selected" : "Select This"}
            </Button>
            
            {expandedPreview.generatedCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCode(expandedPreview)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Code
              </Button>
            )}
            
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
                      ? "bg-indigo-500 scale-125" 
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
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
      <div className="flex items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Education Studio</h1>
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
                <Check className="mr-2 h-4 w-4 text-indigo-500" />
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
            variant="outline"
            size="sm"
            onClick={() => exportCode()}
            disabled={!selectedPreview?.generatedCode}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Code
          </Button>
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={!selectedPreviewId || deploying}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Deploy Selected
          </Button>
        </div>
      </div>

      <div className="px-6 py-3 border-b bg-muted/30 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">Prompt visibility</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserPrompt((prev) => !prev)}
            >
              {showUserPrompt ? "Hide your prompt" : "Show your prompt"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSystemPrompt((prev) => !prev)}
            >
              {showSystemPrompt ? "Hide system prompt" : "Show system prompt"}
            </Button>
          </div>
        </div>
        {showUserPrompt && initialPrompt && (
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Your prompt:</span>{" "}
            <span className="text-foreground">{initialDisplayPrompt || initialPrompt}</span>
          </p>
        )}
        {showSystemPrompt && (
          <div className="rounded-md border border-dashed border-border/50 bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {SYSTEM_PROMPT}
          </div>
        )}
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
                            ? "bg-indigo-500 scale-125"
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
                              ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
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
                                <Badge className="bg-indigo-500 text-white text-xs px-2 py-0">
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
                              {getCurrentPreview()!.preview.generatedCode && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  title="Download code"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportCode(getCurrentPreview()!.preview);
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              )}
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
                              ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
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
                              <div className="flex items-center gap-1">
                                {getCurrentPreview()!.preview.generatedCode && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    title="Download code"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportCode(getCurrentPreview()!.preview);
                                    }}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>
                                )}
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
                              </div>
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
