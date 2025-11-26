"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Database,
  Wand2,
  Settings,
  Send,
  MessageSquare,
  Edit3,
  Download,
  Save,
  FolderOpen,
  Copy,
  Check,
  X,
  Clock,
  Link as LinkIcon,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { SandpackDashboardRenderer } from "@/components/sandpack-dashboard-renderer";
import { cn } from "@/lib/utils";
import { SUPPORTED_MODELS } from "@/lib/constants";
import Link from "next/link";

type GenerationStatus = "idle" | "extracting" | "generating" | "complete" | "error";

interface SavedDashboard {
  id: string;
  name: string;
  code: string;
  goal: string;
  createdAt: number;
  modelId: string;
}

const STORAGE_KEY = "generative-bi-dashboards";

const MODEL_OPTIONS = [
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", description: "Best for complex dashboards" },
  { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5", description: "Fast and efficient" },
  { id: "cerebras/gpt-oss-120b", name: "GPT OSS 120B", description: "Open source alternative" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Google's fast model" },
];

const EXAMPLE_PROMPTS = [
  "Create a revenue dashboard showing monthly trends and key metrics",
  "Build an interactive comparison chart with filters",
  "Visualize quarterly growth with multiple KPIs",
  "Create a sales performance dashboard with regional breakdown",
];

export default function GenerativeBIPage() {
  // State
  const [pdfText, setPdfText] = useState<string>("");
  const [manualText, setManualText] = useState<string>("");
  const [userGoal, setUserGoal] = useState<string>("");
  const [dashboardCode, setDashboardCode] = useState<string>("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("anthropic/claude-sonnet-4.5");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [streamingCode, setStreamingCode] = useState<string>("");
  const [refinementInput, setRefinementInput] = useState<string>("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [showSavedDashboards, setShowSavedDashboards] = useState(false);
  const [dashboardName, setDashboardName] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputType, setInputType] = useState<"file" | "url">("url");
  const [urlInput, setUrlInput] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refinementInputRef = useRef<HTMLInputElement>(null);

  // Load saved dashboards from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedDashboards(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved dashboards:", e);
    }
  }, []);

  // Save dashboards to localStorage when they change
  React.useEffect(() => {
    if (savedDashboards.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDashboards));
      } catch (e) {
        console.error("Failed to save dashboards:", e);
      }
    }
  }, [savedDashboards]);

  // Get the active text (PDF text takes priority if available)
  const activeText = pdfText || manualText;

  // Handle URL scrape
  const handleUrlScrape = async () => {
    if (!urlInput.trim()) return;

    setStatus("extracting");
    setError(null);
    setFileName(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to scrape URL");
      }

      const data = await response.json();
      setPdfText(data.text || "");
      setFileName(data.title || urlInput);
      setStatus("idle");
    } catch (err: any) {
      setError(err.message || "Failed to scrape URL");
      setStatus("error");
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("extracting");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/reports/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract text from file");
      }

      const data = await response.json();
      setPdfText(data.text || "");
      setStatus("idle");
    } catch (err: any) {
      setError(err.message || "Failed to process file");
      setStatus("error");
      setFileName(null);
    }
  };

  // Handle dashboard generation
  const handleGenerate = useCallback(async () => {
    if (!activeText.trim()) {
      setError("Please upload a file or enter data manually");
      return;
    }

    setStatus("generating");
    setError(null);
    setStreamingCode("");
    setDashboardCode("");

    try {
      const response = await fetch("/api/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeText,
          goal: userGoal || "Create an interactive dashboard visualizing this data",
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate dashboard");
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let code = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        code += chunk;
        setStreamingCode(code);
      }

      // Final decode
      code += decoder.decode();
      setDashboardCode(code.trim());
      setStatus("complete");
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate dashboard");
      setStatus("error");
    }
  }, [activeText, userGoal, selectedModel]);

  // Handle reset
  const handleReset = () => {
    setPdfText("");
    setManualText("");
    setUserGoal("");
    setDashboardCode("");
    setStreamingCode("");
    setStatus("idle");
    setError(null);
    setFileName(null);
    setRefinementInput("");
    setRefinementHistory([]);
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle example prompt selection
  const handleExamplePrompt = (prompt: string) => {
    setUserGoal(prompt);
  };

  // Handle dashboard refinement
  const handleRefine = useCallback(async () => {
    if (!refinementInput.trim() || !dashboardCode) return;

    const userRequest = refinementInput.trim();
    setRefinementInput("");
    setIsRefining(true);
    setError(null);

    // Add user message to history
    setRefinementHistory((prev) => [...prev, { role: "user", content: userRequest }]);

    try {
      const response = await fetch("/api/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userRequest,
          currentCode: dashboardCode,
          isRefinement: true,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to refine dashboard");
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let code = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        code += chunk;
        setStreamingCode(code);
      }

      // Final decode
      code += decoder.decode();
      const finalCode = code.trim();
      
      setDashboardCode(finalCode);
      setRefinementHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Dashboard updated: ${userRequest}` },
      ]);
    } catch (err: any) {
      console.error("Refinement error:", err);
      setError(err.message || "Failed to refine dashboard");
      setRefinementHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsRefining(false);
    }
  }, [refinementInput, dashboardCode, selectedModel]);

  // Handle refinement input key press
  const handleRefineKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRefine();
    }
  };

  // Save current dashboard
  const handleSaveDashboard = () => {
    if (!dashboardCode || !dashboardName.trim()) return;

    const newDashboard: SavedDashboard = {
      id: `dashboard-${Date.now()}`,
      name: dashboardName.trim(),
      code: dashboardCode,
      goal: userGoal || "Dashboard",
      createdAt: Date.now(),
      modelId: selectedModel,
    };

    setSavedDashboards((prev) => [newDashboard, ...prev]);
    setShowSaveDialog(false);
    setDashboardName("");
  };

  // Load a saved dashboard
  const handleLoadDashboard = (dashboard: SavedDashboard) => {
    setDashboardCode(dashboard.code);
    setUserGoal(dashboard.goal);
    setSelectedModel(dashboard.modelId);
    setStatus("complete");
    setShowSavedDashboards(false);
    setRefinementHistory([]);
  };

  // Delete a saved dashboard
  const handleDeleteDashboard = (id: string) => {
    setSavedDashboards((prev) => prev.filter((d) => d.id !== id));
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    if (!dashboardCode) return;
    await navigator.clipboard.writeText(dashboardCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as JSX file
  const handleExportJsx = () => {
    if (!dashboardCode) return;

    const fileContent = `// Generated Dashboard Component
// Created: ${new Date().toISOString()}
// Model: ${selectedModel}
// Goal: ${userGoal || "Interactive dashboard"}
//
// Dependencies:
// - react
// - recharts@3.3.0
// - lucide-react
// - clsx
// - tailwind-merge (Tailwind CSS)

${dashboardCode}
`;

    const blob = new Blob([fileContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${Date.now()}.jsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Generative BI</span>
            </Link>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Turn Data into{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Interactive Dashboards
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a PDF report, paste your data, or describe what you want.
              AI will generate a live, interactive React dashboard in seconds.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              {/* Input Type Selection */}
              <div className="bg-muted/30 p-1 rounded-lg flex">
                <button
                  onClick={() => setInputType("url")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                    inputType === "url"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="h-4 w-4" />
                  Enter URL
                </button>
                <button
                  onClick={() => setInputType("file")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                    inputType === "file"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </button>
              </div>

              {/* File Upload or URL Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    {inputType === "url" ? (
                      <LinkIcon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Upload className="h-5 w-5 text-blue-500" />
                    )}
                    {inputType === "url" ? "Data Source URL" : "Upload Data Source"}
                  </h2>
                  {fileName && (
                    <Badge variant="outline" className="gap-1 max-w-[200px] truncate">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{fileName}</span>
                    </Badge>
                  )}
                </div>

                {inputType === "url" ? (
                  <div className="flex gap-2">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/report"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && urlInput) handleUrlScrape();
                      }}
                    />
                    <Button
                      onClick={handleUrlScrape}
                      disabled={!urlInput.trim() || status === "extracting"}
                    >
                      {status === "extracting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                      "hover:border-primary/50 hover:bg-muted/30",
                      status === "extracting" && "pointer-events-none opacity-50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {status === "extracting" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Extracting text from file...
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop a PDF, CSV, or text file here, or click to browse
                        </p>
                      </>
                    )}
                  </div>
                )}

                {pdfText && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Extracted Text Preview
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPdfText("");
                          setFileName(null);
                        }}
                        className="h-6 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {pdfText.slice(0, 300)}...
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Manual Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border p-6 shadow-sm"
              >
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-green-500" />
                  Or Paste Data Manually
                </h2>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={`Paste your data here... Example:
{
  "sales": [
    { "month": "Jan", "revenue": 45000, "profit": 12000 },
    { "month": "Feb", "revenue": 52000, "profit": 15000 }
  ]
}`}
                  className={cn(
                    "w-full h-32 px-3 py-2 text-sm rounded-lg resize-none",
                    "bg-background border focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "font-mono"
                  )}
                  disabled={!!pdfText}
                />
              </motion.div>

              {/* Goal Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border p-6 shadow-sm"
              >
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                  <Wand2 className="h-5 w-5 text-purple-500" />
                  Describe Your Dashboard
                </h2>
                <Input
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  placeholder="e.g., Create a revenue dashboard with monthly trends and regional breakdown"
                  className="mb-3"
                />
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExamplePrompt(prompt)}
                      className="text-xs h-7"
                    >
                      {prompt.slice(0, 35)}...
                    </Button>
                  ))}
                </div>
              </motion.div>

              {/* Advanced Settings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    Advanced Settings
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t"
                    >
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Model
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {MODEL_OPTIONS.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                className={cn(
                                  "p-3 rounded-lg border text-left transition-all",
                                  selectedModel === model.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:border-primary/50 hover:bg-muted/30"
                                )}
                              >
                                <p className="font-medium text-sm">{model.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {model.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Button
                  onClick={handleGenerate}
                  disabled={!activeText.trim() || status === "generating" || status === "extracting"}
                  className="flex-1 h-12 text-base gap-2"
                >
                  {status === "generating" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Dashboard...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Dashboard
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={status === "generating" || status === "extracting"}
                  className="h-12"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden"
              >
                {/* Preview Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Dashboard Preview
                  </h2>
                  <div className="flex items-center gap-2">
                    {status === "complete" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyCode}
                          className="h-8 gap-1"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleExportJsx}
                          className="h-8 gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSaveDialog(true)}
                          className="h-8 gap-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save
                        </Button>
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Live
                        </Badge>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedDashboards(!showSavedDashboards)}
                      className="h-8 gap-1"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      {savedDashboards.length > 0 && (
                        <span className="text-xs">({savedDashboards.length})</span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Save Dialog */}
                <AnimatePresence>
                  {showSaveDialog && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b bg-muted/30 p-4"
                    >
                      <div className="flex gap-2">
                        <Input
                          value={dashboardName}
                          onChange={(e) => setDashboardName(e.target.value)}
                          placeholder="Name your dashboard..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveDashboard();
                            if (e.key === "Escape") setShowSaveDialog(false);
                          }}
                          autoFocus
                        />
                        <Button
                          onClick={handleSaveDashboard}
                          disabled={!dashboardName.trim()}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSaveDialog(false)}
                          className="h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Saved Dashboards Panel */}
                <AnimatePresence>
                  {showSavedDashboards && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b bg-muted/20 max-h-64 overflow-y-auto"
                    >
                      {savedDashboards.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                          <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No saved dashboards yet</p>
                          <p className="text-xs mt-1">Generate a dashboard and save it to see it here</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {savedDashboards.map((dashboard) => (
                            <div
                              key={dashboard.id}
                              className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                            >
                              <button
                                onClick={() => handleLoadDashboard(dashboard)}
                                className="flex-1 text-left min-w-0"
                              >
                                <p className="font-medium text-sm truncate">{dashboard.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(dashboard.createdAt)}
                                </p>
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDashboard(dashboard.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview Content */}
                <div className="min-h-[500px]">
                  {status === "idle" && !dashboardCode && (
                    <div className="h-[500px] flex flex-col items-center justify-center text-center p-8">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg mb-2">No Dashboard Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Upload your data and describe what you want to visualize.
                        The AI will generate an interactive dashboard.
                      </p>
                      <div className="flex gap-4 mt-6">
                        <div className="flex flex-col items-center">
                          <LineChart className="h-6 w-6 text-blue-500 mb-1" />
                          <span className="text-xs text-muted-foreground">Line Charts</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <BarChart3 className="h-6 w-6 text-green-500 mb-1" />
                          <span className="text-xs text-muted-foreground">Bar Charts</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <PieChart className="h-6 w-6 text-purple-500 mb-1" />
                          <span className="text-xs text-muted-foreground">Pie Charts</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === "generating" && (
                    <div className="h-[500px] flex flex-col items-center justify-center text-center p-8">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <h3 className="font-medium text-lg mb-2">Generating Dashboard</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mb-4">
                        AI is analyzing your data and building an interactive visualization...
                      </p>
                      {streamingCode.length > 0 && (
                        <div className="w-full max-w-sm">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Code generated</span>
                            <span>{streamingCode.length} chars</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((streamingCode.length / 3000) * 100, 100)}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(status === "complete" || dashboardCode) && (
                    <SandpackDashboardRenderer
                      code={dashboardCode}
                      title=""
                      description=""
                      showEditor={false}
                      previewHeight={500}
                    />
                  )}
                </div>
              </motion.div>

              {/* Prompt Refiner Chat Interface */}
              {dashboardCode && status === "complete" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 bg-card rounded-xl border shadow-sm overflow-hidden"
                >
                  <div className="p-4 border-b flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Refine Your Dashboard</h2>
                    <Badge variant="outline" className="ml-auto text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat to modify
                    </Badge>
                  </div>

                  {/* Refinement History */}
                  {refinementHistory.length > 0 && (
                    <div className="max-h-48 overflow-y-auto p-4 space-y-3 border-b">
                      {refinementHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Refinement Input */}
                  <div className="p-4">
                    <div className="flex gap-2">
                      <Input
                        ref={refinementInputRef}
                        value={refinementInput}
                        onChange={(e) => setRefinementInput(e.target.value)}
                        onKeyDown={handleRefineKeyPress}
                        placeholder="Try: 'Make it a bar chart', 'Add a date filter', 'Change colors to blue'"
                        disabled={isRefining}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleRefine}
                        disabled={!refinementInput.trim() || isRefining}
                        size="icon"
                        className="shrink-0"
                      >
                        {isRefining ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setRefinementInput("Make this a bar chart instead")}
                        disabled={isRefining}
                      >
                        Bar chart
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setRefinementInput("Add a filter dropdown")}
                        disabled={isRefining}
                      >
                        Add filter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setRefinementInput("Use blue color scheme")}
                        disabled={isRefining}
                      >
                        Blue colors
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setRefinementInput("Add more interactive controls")}
                        disabled={isRefining}
                      >
                        More controls
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

