"use client";

import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const articles = [
  {
    title: "The State of AI",
    source: "McKinsey",
    url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
    summary: "McKinsey's latest perspective on enterprise AI adoption and performance.",
  },
  {
    title: "How Data-Driven Intelligence Powers the Age of AI Agents",
    source: "Bain | Microsoft Ignite 2025",
    url: "https://www.bain.com/insights/microsoft-ignite-2025-how-data-driven-intelligence-powers-the-age-of-ai-agents/",
    summary: "Bain's take on data-first strategies enabling practical AI agents.",
  },
  {
    title: "BCG Artificial Intelligence",
    source: "BCG",
    url: "https://www.bcg.com/capabilities/artificial-intelligence",
    summary: "BCG's hub for AI capabilities, case studies, and industry programs.",
  },
  {
    title: "AI Agents Topic Hub",
    source: "IBM Think",
    url: "https://www.ibm.com/think/topics/ai-agents",
    summary: "IBM's deep dive into AI agents, architectures, and applied patterns.",
  },
];

export default function InteractiveInsightsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        <header className="space-y-3">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em]">
            Interactive
          </Badge>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">AI Insight Explorer</h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-3xl">
                Read top analyst viewpoints in-page, then collaborate with the assistant below to summarize, compare, or draft takeaways.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {articles.map((article) => (
                <Button key={article.url} variant="outline" size="sm" asChild>
                  <a href={article.url} target="_blank" rel="noreferrer">
                    Open {article.source}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div key={article.url} className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono uppercase text-muted-foreground tracking-[0.25em]">{article.source}</p>
                  <h2 className="text-lg md:text-xl font-semibold leading-snug">{article.title}</h2>
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={article.url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </Button>
              </div>
              <div className="border-t">
                <iframe
                  src={article.url}
                  title={`${article.source} - ${article.title}`}
                  className="w-full h-[75vh] min-h-[520px]"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <p className="text-[11px] text-muted-foreground/80 px-4 py-2 border-t">
                If this site blocks embedding, use the open button to view it in a new tab.
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-4 md:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-xl font-semibold">Workspace Chat</h3>
              <p className="text-sm text-muted-foreground">
                Summarize articles, compare viewpoints, or draft briefs using the assistant.
              </p>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/30 overflow-hidden">
            <Chat embedded />
          </div>
        </div>
      </div>
    </div>
  );
}
