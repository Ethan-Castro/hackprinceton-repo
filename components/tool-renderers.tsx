"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactAction,
  ArtifactContent,
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai-elements";
import { SandpackDashboardRenderer } from "@/components/sandpack-dashboard-renderer";
import { getToolDisplayName } from "@/lib/tool-display-names";

export type ArtifactRendererData = {
  title?: string;
  description?: string;
  content: string;
  contentType: "code" | "text" | "markdown" | "html";
  language?: string;
};

export type WebPreviewRendererData = {
  url: string;
  title?: string;
  description?: string;
};

export type HtmlPreviewRendererData = {
  html: string;
  dataUrl?: string;
  title?: string;
  description?: string;
};

export function ArtifactRenderer({
  data,
}: {
  data: ArtifactRendererData;
}) {
  const [copied, setCopied] = React.useState(false);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const artifactRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!artifactRef.current) return;
    
    setIsExportingPdf(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Capture the artifact with better quality
      const canvas = await html2canvas(artifactRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: artifactRef.current.scrollWidth,
        windowHeight: artifactRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Calculate PDF dimensions maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      const pageHeight = 297; // A4 height in mm
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Handle multi-page content
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }
      
      // Generate filename
      const filename = data.title
        ? `${data.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        : `artifact-${Date.now()}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      // Fallback to text download
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `artifact-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <Artifact 
      ref={artifactRef}
      className="my-6 rounded-xl border border-border/50 bg-card shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-200 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 overflow-hidden"
    >
      <ArtifactHeader className="border-b border-border/50 bg-muted/30 backdrop-blur-sm">
        <div className="space-y-1">
          {data.title && (
            <ArtifactTitle className="text-lg font-semibold text-foreground">
              {data.title}
            </ArtifactTitle>
          )}
          {data.description && (
            <ArtifactDescription className="text-sm text-muted-foreground">
              {data.description}
            </ArtifactDescription>
          )}
        </div>
        <ArtifactActions>
          <ArtifactAction
            tooltip="Copy to clipboard"
            label="Copy"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            className="hover:bg-accent/50 transition-colors"
          />
          {isExportingPdf ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="h-8 w-8"
                    aria-label="Exporting PDF..."
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporting PDF...</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <ArtifactAction
              tooltip="Download as PDF"
              label="Download PDF"
              icon={Download}
              onClick={handleDownloadPdf}
              className="hover:bg-accent/50 transition-colors"
            />
          )}
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent 
        ref={contentRef}
        className="p-6 md:p-8 bg-gradient-to-b from-card to-muted/20"
      >
        {data.contentType === "code" ? (
          <div className="rounded-lg border border-border/50 bg-muted/40 p-6 shadow-inner overflow-x-auto">
            <pre className="text-sm leading-relaxed font-mono">
              <code className={data.language ? `language-${data.language}` : ""}>
                {data.content}
              </code>
            </pre>
          </div>
        ) : data.contentType === "markdown" ? (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted/40 prose-pre:border prose-pre:border-border/50 prose-blockquote:border-l-primary prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-table:border-collapse prose-th:border prose-th:border-border/50 prose-th:bg-muted/30 prose-th:p-2 prose-td:border prose-td:border-border/50 prose-td:p-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.content}
            </ReactMarkdown>
          </div>
        ) : data.contentType === "html" ? (
          <div 
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {data.content}
          </div>
        )}
      </ArtifactContent>
    </Artifact>
  );
}

export function WebPreviewRenderer({
  data,
}: {
  data: WebPreviewRendererData;
}) {
  return (
    <div className="my-4 space-y-2">
      {(data.title || data.description) && (
        <div>
          {data.title && (
            <h3 className="font-semibold text-base">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}
        </div>
      )}
      <WebPreview defaultUrl={data.url} className="h-[600px]">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    </div>
  );
}

export function HtmlPreviewRenderer({
  data,
}: {
  data: HtmlPreviewRendererData;
}) {
  const [showCode, setShowCode] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const hasPreview = Boolean(data.html || data.dataUrl);
  const previewUrl = data.dataUrl ?? "";
  const previewSrcDoc = previewUrl ? undefined : data.html;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasPreview) {
    return (
      <div className="my-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Preview unavailable because no HTML was returned.
      </div>
    );
  }

  return (
    <div className="my-4 space-y-2">
      {(data.title || data.description) && (
        <div>
          {data.title && (
            <h3 className="font-semibold text-base">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}
        </div>
      )}
      <div className="flex gap-2 mb-2">
        <Button
          variant={showCode ? "ghost" : "secondary"}
          size="sm"
          onClick={() => setShowCode(false)}
        >
          Preview
        </Button>
        <Button
          variant={showCode ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowCode(true)}
        >
          Code
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="ml-auto">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      {showCode ? (
        <Artifact>
          <ArtifactContent>
            <pre className="text-sm overflow-x-auto bg-muted/30 p-4 rounded-lg">
              <code className="language-html">{data.html}</code>
            </pre>
          </ArtifactContent>
        </Artifact>
      ) : (
        <WebPreview defaultUrl={previewUrl} className="h-[600px]">
          <WebPreviewNavigation>
            <WebPreviewUrl />
          </WebPreviewNavigation>
          <WebPreviewBody src={previewUrl || undefined} srcDoc={previewSrcDoc} />
        </WebPreview>
      )}
    </div>
  );
}

/**
 * Data type for React Dashboard tool output
 */
export type ReactDashboardRendererData = {
  code: string;
  title?: string;
  description?: string;
  type?: "react-dashboard";
};

/**
 * Renderer for generateReactDashboard tool output
 * Uses Sandpack to render the generated React code in an iframe
 */
export function ReactDashboardRenderer({
  data,
}: {
  data: ReactDashboardRendererData;
}) {
  return (
    <div className="my-4">
      <SandpackDashboardRenderer
        code={data.code}
        title={data.title}
        description={data.description}
        showEditor={false}
        previewHeight={600}
      />
    </div>
  );
}

export type GenericToolRendererData = {
  toolName: string;
  state: "input-available" | "output-available" | "error";
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
};

export function GenericToolRenderer({
  data,
}: {
  data: GenericToolRendererData;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getStatusIcon = () => {
    const iconClass = "h-4 w-4";
    switch (data.state) {
      case "input-available":
        return <div className={`${iconClass} animate-spin rounded-full border-2 border-blue-500 border-t-transparent`} />;
      case "output-available":
        return <Check className={`${iconClass} text-green-500`} />;
      case "error":
        return <span className={`${iconClass} text-red-500 font-bold`}>✕</span>;
    }
  };

  const getStatusText = () => {
    switch (data.state) {
      case "input-available":
        return "Executing...";
      case "output-available":
        return "Completed";
      case "error":
        return "Error";
    }
  };

  const getStatusColor = () => {
    switch (data.state) {
      case "input-available":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "output-available":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "error":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    }
  };

  // Use shared tool display name utility
  const formatToolName = getToolDisplayName;

  return (
    <div className={`my-4 rounded-lg border ${data.state === "error" ? "border-red-500/50" : "border-border"} bg-card p-4 shadow-sm transition-all duration-200`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-muted-foreground">🔧</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">
              {formatToolName(data.toolName)}
            </h4>
            <p className="text-xs text-muted-foreground">Tool Call</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-md border ${getStatusColor()}`}>
            <span className="flex items-center gap-1.5">
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </span>
          {(data.input || data.output || data.error) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? "▼" : "▶"}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {data.input && Object.keys(data.input).length > 0 && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Input
              </h5>
              <div className="rounded-md bg-muted/50 p-3 text-xs font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(data.input, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {data.error && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                Error
              </h5>
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-xs">
                {data.error}
              </div>
            </div>
          )}

          {(data.output && data.state === "output-available") ? (
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Output
              </h5>
              <div className="rounded-md bg-muted/50 p-3 text-xs font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {typeof data.output === "string"
                    ? (data.output as string)
                    : JSON.stringify(data.output, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
