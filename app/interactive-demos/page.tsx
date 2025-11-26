"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";
import { HtmlPreviewRenderer } from "@/components/tool-renderers";

export default function InteractiveDemosPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedArticle, setScrapedArticle] = useState<{
    title: string;
    description: string;
    markdown: string;
    url: string;
  } | null>(null);
  const [generatedDemo, setGeneratedDemo] = useState<{
    html: string;
    dataUrl: string;
    title?: string;
    description?: string;
  } | null>(null);

  const handleLoadArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setScrapedArticle(null);
    setGeneratedDemo(null);

    try {
      const response = await fetch("/api/open-lovable/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, formats: ["markdown", "html"] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch article");
      }

      if (!data.success || !data.data) {
         throw new Error("Invalid response format");
      }

      setScrapedArticle({
        title: data.data.title || "Untitled Article",
        description: data.data.description || "No description available",
        markdown: data.data.markdown || "",
        url: url,
      });
    } catch (err) {
      console.error("Error loading article:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolCall = (toolName: string, args: any, result: any) => {
    if (toolName === 'generateHtmlPreview' && result) {
      setGeneratedDemo(result as any);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        
        {/* Header */}
        <header className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
             <Badge variant="outline" className="px-3 py-1 text-sm rounded-full border-primary/20 text-primary/80">
                Interactive Demos
             </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
            Interactive <span className="font-serif italic text-muted-foreground">Demo Generator</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-light leading-relaxed mx-auto md:mx-0">
            Paste an article URL to extract its key concepts and generate interactive simulations, visualizations, or demos using AI.
          </p>
        </header>

        {/* URL Input */}
        <Card className="bg-muted/30 border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleLoadArticle} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Paste article URL here (e.g., https://example.com/article)..." 
                  className="pl-9 h-11 bg-background border-muted-foreground/20"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" size="lg" disabled={isLoading || !url.trim()} className="h-11 px-8">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                  </>
                ) : (
                  "Load Article"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Area */}
        {scrapedArticle ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Article Content (Markdown) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card className="border shadow-sm bg-background overflow-hidden">
                <CardHeader className="pb-4 bg-muted/10">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs font-normal truncate max-w-[300px]">
                      {new URL(scrapedArticle.url).hostname}
                    </Badge>
                    <CardTitle className="text-3xl font-serif leading-tight text-balance">
                      {scrapedArticle.title}
                    </CardTitle>
                    <CardDescription className="text-base text-balance">
                      {scrapedArticle.description}
                    </CardDescription>
                  </div>
                  <div className="pt-2">
                     <Button variant="link" size="sm" className="px-0 h-auto text-muted-foreground hover:text-primary" asChild>
                        <a href={scrapedArticle.url} target="_blank" rel="noreferrer">
                           View Original Source <Globe className="ml-1 h-3 w-3" />
                        </a>
                     </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                   <div className="prose dark:prose-invert prose-lg max-w-none">
                      <ReactMarkdown>{scrapedArticle.markdown}</ReactMarkdown>
                   </div>
                   
                   {/* Inline Demo Area */}
                   <div className="mt-12 space-y-4">
                      {generatedDemo ? (
                        <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
                           <div className="p-4 border-b bg-muted/10 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <h3 className="font-medium text-sm">Interactive Demo</h3>
                           </div>
                           <div className="p-4">
                              <HtmlPreviewRenderer data={generatedDemo} />
                           </div>
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed rounded-xl bg-muted/30 text-center space-y-4">
                           <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                             <Sparkles className="h-6 w-6 text-primary" />
                           </div>
                           <div>
                             <h3 className="font-medium text-lg">Interactive Workspace</h3>
                             <p className="text-muted-foreground max-w-md mx-auto">
                               Ask the assistant on the right to generate a demo, chart, or visualization based on this article. It will appear here.
                             </p>
                           </div>
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Interactive Chat */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 h-[calc(100vh-100px)] min-h-[600px] rounded-2xl border bg-background shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-muted/10 shrink-0 flex justify-between items-center">
                  <div>
                     <h3 className="font-medium">Demo Generator</h3>
                     <p className="text-xs text-muted-foreground">Generate interactive elements</p>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Chat 
                    embedded 
                    apiEndpoint="/api/interactive-demos/chat" 
                    extraBody={{ articleContext: scrapedArticle.markdown }}
                    onToolCall={handleToolCall}
                  />
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-60">
             <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center">
               <BookOpen className="h-10 w-10 text-muted-foreground" />
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-medium">Ready to explore</h3>
               <p className="text-muted-foreground max-w-md mx-auto">
                 Enter an article URL above to get started. The AI will analyze the content and help you visualize the key concepts.
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
