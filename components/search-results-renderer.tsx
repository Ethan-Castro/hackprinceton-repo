"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search } from "lucide-react";
import type { SearchToolOutput } from "@/lib/exa-search-tools";
import type { FirecrawlToolOutput } from "@/lib/firecrawl-tools";
import type { ParallelAgentOutput } from "@/lib/parallel-ai-tools";

export function SearchResultsRenderer({ data }: { data: SearchToolOutput }) {
  const { query, results, totalResults } = data;

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <CardTitle>Web Search Results</CardTitle>
        </div>
        <CardDescription>
          Found {totalResults} results for &ldquo;{query}&rdquo;
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, idx) => (
          <div key={idx} className="border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold truncate flex items-center gap-1"
                >
                  {result.title}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {result.url}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground mt-2 line-clamp-3">
              {result.content}
            </p>
            {result.publishedDate && (
              <p className="text-xs text-muted-foreground mt-2">
                Published: {new Date(result.publishedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function FirecrawlResultsRenderer({ data }: { data: FirecrawlToolOutput }) {
  const { url, content, success } = data;

  if (!success) {
    return (
      <Card className="w-full shadow-border-medium border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Scraping Failed</CardTitle>
          <CardDescription>Could not scrape {url}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1 truncate"
            >
              {content.title || "Scraped Content"}
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </div>
        </div>
        <CardDescription>
          Content length: {content.length.toLocaleString()} characters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.markdown && (
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words text-sm">
              {content.markdown}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ParallelAgentResultsRenderer({
  data,
}: {
  data: ParallelAgentOutput;
}) {
  const { taskId, status, result } = data;

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Parallel AI Agent Task</CardTitle>
          <Badge
            variant={
              status === "completed"
                ? "default"
                : status === "failed"
                  ? "destructive"
                  : "secondary"
            }
          >
            {status}
          </Badge>
        </div>
        <CardDescription>Task ID: {taskId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result?.output && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Result:</p>
            <p className="text-sm whitespace-pre-wrap break-words">
              {result.output}
            </p>
          </div>
        )}
        {result?.error && (
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-600 mb-2">Error:</p>
            <p className="text-sm text-red-700">{result.error}</p>
          </div>
        )}
        {status === "processing" && (
          <p className="text-sm text-muted-foreground italic">
            Task is still processing...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
