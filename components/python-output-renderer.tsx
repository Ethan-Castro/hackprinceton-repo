"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { PythonToolOutput, PythonExecutionResult } from "@/lib/python-tools";
import { AlertCircle, CheckCircle2, Code2, Image, Terminal, ChevronDown } from "lucide-react";
import { useState } from "react";

export function PythonOutputRenderer({ data }: { data: PythonToolOutput }) {
  const [expandedSection, setExpandedSection] = useState<string>("output");

  if (!data.success || !data.result) {
    return (
      <Card className="w-full shadow-border-medium border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Python Execution Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-destructive">
            {data.error || "Unknown error occurred"}
          </pre>
        </CardContent>
      </Card>
    );
  }

  const result: PythonExecutionResult = data.result;
  const hasPlots = result.plots && result.plots.length > 0;
  const hasOutput = result.output || result.stdout;
  const hasError = result.stderr;

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Python Code Executed
        </CardTitle>
        <CardDescription>
          Execution time: {result.executionTime}ms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible
          open={expandedSection === "code"}
          onOpenChange={(open) => setExpandedSection(open ? "code" : "")}
        >
          <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors w-full">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === "code" ? "rotate-180" : ""
              }`}
            />
            <Code2 className="h-4 w-4" />
            Code
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                <code>{result.code}</code>
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {hasOutput && (
          <Collapsible
            open={expandedSection === "output"}
            onOpenChange={(open) => setExpandedSection(open ? "output" : "")}
          >
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors w-full">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSection === "output" ? "rotate-180" : ""
                }`}
              />
              <Terminal className="h-4 w-4" />
              Output
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                  {result.output}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {hasPlots && (
          <Collapsible
            open={expandedSection === "plots"}
            onOpenChange={(open) => setExpandedSection(open ? "plots" : "")}
          >
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors w-full">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSection === "plots" ? "rotate-180" : ""
                }`}
              />
              <Image className="h-4 w-4" />
              Plots ({result.plots.length})
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="grid gap-4">
                {result.plots.map((plot, index) => (
                  <div key={index} className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${plot}`}
                      alt={`Plot ${index + 1}`}
                      className="max-w-full h-auto rounded-lg border border-border"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {hasError && (
          <Collapsible
            open={expandedSection === "errors"}
            onOpenChange={(open) => setExpandedSection(open ? "errors" : "")}
          >
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors w-full">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSection === "errors" ? "rotate-180" : ""
                }`}
              />
              <AlertCircle className="h-4 w-4" />
              Errors
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-destructive/10 p-4 rounded-lg overflow-x-auto border border-destructive/50">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words text-destructive">
                  {result.stderr}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
