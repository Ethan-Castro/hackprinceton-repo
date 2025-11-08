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
  dataUrl: string;
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {showCode && (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="ml-auto">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        )}
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
        <WebPreview defaultUrl={data.dataUrl} className="h-[600px]">
          <WebPreviewNavigation>
            <WebPreviewUrl />
          </WebPreviewNavigation>
          <WebPreviewBody />
        </WebPreview>
      )}
    </div>
  );
}
