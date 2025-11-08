'use client';

import * as React from 'react';
import { Code, Copy, Check, Play, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CodeExampleProps {
  title: string;
  description: string;
  code: string;
  language: string;
  explanation: string;
  runnable?: boolean;
  output?: string;
  className?: string;
}

export const CodeExample: React.FC<CodeExampleProps> = ({
  title,
  description,
  code,
  language,
  explanation,
  runnable = false,
  output,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showOutput, setShowOutput] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setShowOutput(true);
    // In a real implementation, you might execute the code safely
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-card shadow-border-medium overflow-hidden transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>

          {/* Language Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300">
              {language}
            </span>
          </div>
        </div>
      </div>

      {/* Code Block */}
      <div className="p-6 space-y-4">
        <div className="relative rounded-lg overflow-hidden border bg-muted/50">
          {/* Code Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">
              {language.toUpperCase()} CODE
            </span>
            <div className="flex items-center gap-1">
              {runnable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRun}
                        className="h-7 w-7 hover:scale-105 transition-transform duration-150"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Run Code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-7 w-7 hover:scale-105 transition-transform duration-150"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy Code'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Code Content */}
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm font-mono">
              <code className={`language-${language}`}>{code}</code>
            </pre>
          </div>
        </div>

        {/* Output */}
        {runnable && showOutput && output && (
          <div className="relative rounded-lg overflow-hidden border bg-gray-900 dark:bg-gray-950">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800 dark:bg-gray-900">
              <Terminal className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-medium text-gray-300">OUTPUT</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-green-400">
                <code>{output}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <span className="text-xs">?</span>
              </span>
              Explanation
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
