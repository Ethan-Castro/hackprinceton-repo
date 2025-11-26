"use client";

import * as React from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { Loader2, Code, Eye, Terminal, RefreshCw, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pre-configured dependencies that match the system prompt constraints
 * These are the only packages the generated code can import from
 */
const SANDPACK_DEPENDENCIES = {
  recharts: "^3.3.0",
  "lucide-react": "^0.506.0",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.2.0",
};

/**
 * Index HTML template with Tailwind CSS CDN
 */
const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {}
        }
      }
    </script>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

/**
 * Entry point that renders the App component
 */
const INDEX_JS = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`;

export interface SandpackDashboardRendererProps {
  /** The React component code to render */
  code: string;
  /** Title displayed above the dashboard */
  title?: string;
  /** Description of what the dashboard shows */
  description?: string;
  /** Whether to show the code editor (default: false) */
  showEditor?: boolean;
  /** Whether to show the console (default: false) */
  showConsole?: boolean;
  /** Height of the preview area (default: 600px) */
  previewHeight?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback when code changes (for persistence) */
  onCodeChange?: (newCode: string) => void;
}

type ViewMode = "preview" | "code" | "split";

/**
 * Clean the generated code by removing markdown fences and ensuring valid React
 */
function cleanGeneratedCode(code: string): string {
  let cleaned = code
    // Remove markdown code fences
    .replace(/^```(jsx|js|tsx|ts|javascript|typescript)?\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();

  // Ensure the code has an export default
  if (!cleaned.includes("export default")) {
    // Try to find a function App and add export
    if (cleaned.includes("function App")) {
      cleaned = cleaned.replace("function App", "export default function App");
    } else {
      // Wrap in a basic component if no App function found
      cleaned = `${cleaned}\n\nexport default function App() { return <div className="p-4 text-red-500">Error: No App component found in generated code</div>; }`;
    }
  }

  return cleaned;
}

export function SandpackDashboardRenderer({
  code,
  title,
  description,
  showEditor = false,
  showConsole = false,
  previewHeight = 600,
  className,
  onCodeChange,
}: SandpackDashboardRendererProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>(showEditor ? "split" : "preview");
  const [copied, setCopied] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Clean the code
  const cleanedCode = React.useMemo(() => cleanGeneratedCode(code), [code]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(cleanedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle download as JSX file
  const handleDownload = () => {
    const blob = new Blob([cleanedCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${Date.now()}.jsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset loading state when code changes
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [code]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      {(title || description) && (
        <div>
          {title && (
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            className="gap-1.5"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant={viewMode === "code" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("code")}
            className="gap-1.5"
          >
            <Code className="h-4 w-4" />
            Code
          </Button>
          <Button
            variant={viewMode === "split" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
            className="gap-1.5"
          >
            <Terminal className="h-4 w-4" />
            Split
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Sandpack Container */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <SandpackProvider
          template="react"
          theme="auto"
          files={{
            "/App.js": cleanedCode,
            "/index.js": INDEX_JS,
            "/public/index.html": INDEX_HTML,
          }}
          customSetup={{
            dependencies: SANDPACK_DEPENDENCIES,
          }}
          options={{
            recompileMode: "delayed",
            recompileDelay: 500,
            autorun: true,
            autoReload: true,
          }}
        >
          <SandpackLayout
            style={{
              borderRadius: 0,
              border: "none",
            }}
          >
            {/* Code Editor (left side in split mode) */}
            {(viewMode === "code" || viewMode === "split") && (
              <SandpackCodeEditor
                style={{
                  height: viewMode === "split" ? previewHeight : previewHeight,
                  minWidth: viewMode === "split" ? "50%" : "100%",
                }}
                showLineNumbers
                showInlineErrors
                wrapContent
                closableTabs={false}
              />
            )}

            {/* Preview (right side in split mode) */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="relative flex-1">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Loading dashboard...
                      </span>
                    </div>
                  </div>
                )}
                <SandpackPreview
                  style={{
                    height: previewHeight,
                    minWidth: viewMode === "split" ? "50%" : "100%",
                  }}
                  showNavigator={false}
                  showRefreshButton
                  showOpenInCodeSandbox={false}
                  actionsChildren={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 100);
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            )}
          </SandpackLayout>

          {/* Console (optional) */}
          {showConsole && (
            <div className="border-t">
              <SandpackConsole style={{ height: 150 }} />
            </div>
          )}
        </SandpackProvider>
      </div>

      {/* Error indicator */}
      {hasError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          There was an error rendering the dashboard. Try regenerating or check
          the code for syntax errors.
        </div>
      )}
    </div>
  );
}

/**
 * Streaming version that accumulates code as it streams in
 */
export function StreamingSandpackRenderer({
  codeStream,
  title,
  description,
  ...props
}: Omit<SandpackDashboardRendererProps, "code"> & {
  codeStream: string;
}) {
  const [isComplete, setIsComplete] = React.useState(false);

  // Show a placeholder while streaming
  if (!isComplete && codeStream.length < 100) {
    return (
      <div className="border rounded-lg p-8 bg-card">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Generating dashboard...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {codeStream.length} characters generated
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SandpackDashboardRenderer
      code={codeStream}
      title={title}
      description={description}
      {...props}
    />
  );
}

export default SandpackDashboardRenderer;

