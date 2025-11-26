"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download } from "lucide-react";
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([data.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artifact-${Date.now()}.${
      data.contentType === "code" ? data.language || "txt" : "txt"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Artifact className="my-4">
      <ArtifactHeader>
        <div>
          {data.title && <ArtifactTitle>{data.title}</ArtifactTitle>}
          {data.description && (
            <ArtifactDescription>{data.description}</ArtifactDescription>
          )}
        </div>
        <ArtifactActions>
          <ArtifactAction
            tooltip="Copy to clipboard"
            label="Copy"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          />
          <ArtifactAction
            tooltip="Download"
            label="Download"
            icon={Download}
            onClick={handleDownload}
          />
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent>
        {data.contentType === "code" ? (
          <pre className="text-sm overflow-x-auto bg-muted/30 p-4 rounded-lg">
            <code className={data.language ? `language-${data.language}` : ""}>
              {data.content}
            </code>
          </pre>
        ) : (
          <div className="prose dark:prose-invert max-w-none">{data.content}</div>
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

  // Format tool name for display (convert camelCase to Title Case)
  const formatToolName = (name: string) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

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
