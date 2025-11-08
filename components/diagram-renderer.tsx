"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CanvasToolOutput } from "@/lib/canvas-tools";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Initialize mermaid
mermaid.initialize({ startOnLoad: true, theme: "base" });

export function DiagramRenderer({ data }: { data: CanvasToolOutput }) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !data.success) return;

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(
          `diagram-${Date.now()}`,
          data.mermaidCode
        );
        if (svgRef.current) {
          svgRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (svgRef.current) {
          svgRef.current.innerHTML = `<div class="text-destructive p-4">Error rendering diagram</div>`;
        }
      }
    };

    renderDiagram();
  }, [data.mermaidCode, data.success]);

  if (!data.success) {
    return (
      <Card className="w-full shadow-border-medium border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Diagram Generation Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-destructive">
            {data.title || "Unknown error occurred"}
          </pre>
        </CardContent>
      </Card>
    );
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {data.title}
            </CardTitle>
            {data.description && (
              <CardDescription>{data.description}</CardDescription>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyCode}
            className="mt-1"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center overflow-x-auto rounded-lg border border-border bg-white dark:bg-slate-950 p-4">
            <div
              ref={svgRef}
              className="flex justify-center items-center"
              style={{ minHeight: "300px" }}
            />
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
              View Mermaid Code
            </summary>
            <pre className="mt-2 bg-muted p-3 rounded overflow-x-auto text-xs whitespace-pre-wrap break-words">
              <code>{data.mermaidCode}</code>
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
