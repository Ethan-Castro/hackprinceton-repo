"use client";

import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Lightbulb } from "lucide-react";

const articleUrl = "https://www.bain.com/insights/defining-the-intelligent-enterprise/";

const articles = [
  {
    title: "Defining the Intelligent Enterprise",
    source: "Bain & Company",
    url: articleUrl,
    summary: "AI Dev 25 × NYC marked another turning point. Agentic systems are moving from single-agent pilots to coordinated multi-agent networks.",
  },
  {
    title: "Multi-Agent Architectures",
    source: "Bain & Company",
    url: articleUrl,
    summary: "Swarms coordinate many task-specific agents toward a shared objective. Meshes create persistent networks of agents across various domains.",
  },
  {
    title: "Vibe Coding & Rapid Prototyping",
    source: "Bain & Company",
    url: articleUrl,
    summary: "A creative and conversational method for building software. Go from idea to interactive prototype in real time.",
  },
  {
    title: "Small AI as Strategic Advantage",
    source: "Bain & Company",
    url: articleUrl,
    summary: "Compact models now match or surpass larger models on specific tasks while offering improved latency, cost control, and transparency.",
  },
  {
    title: "Trust & Enterprise AI Readiness",
    source: "Bain & Company",
    url: articleUrl,
    summary: "Each agent must possess a verifiable identity, a defined scope of authority, and minimal necessary access to data and tools.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function InteractiveInsightsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 md:px-10 font-sans">
      <div className="max-w-[95vw] mx-auto space-y-8 md:space-y-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
            Interactive Insights
          </Badge>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-light tracking-tighter text-foreground">
                Interactive <span className="font-serif italic text-muted-foreground">Insights</span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-3xl font-light leading-relaxed">
                Explore key ideas from industry research. Each card highlights a different concept from the same source—scroll through, read in-page, and use the chat to remove confusion or draft takeaways.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <a href={articleUrl} target="_blank" rel="noreferrer">
                <Lightbulb className="mr-2 h-4 w-4" />
                Open Full Article
              </a>
            </Button>
          </div>
        </motion.header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <div className="w-full overflow-x-auto overflow-y-hidden hide-scrollbar">
            <div className="flex w-max space-x-6 p-4">
              {articles.map((article, i) => (
                <motion.div key={`${article.title}-${i}`} variants={item} className="w-[85vw] md:w-[800px] shrink-0">
                  <Card className="border-none shadow-sm bg-muted/30 h-full overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 whitespace-normal">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs font-mono tracking-wider uppercase">
                              {article.source}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {i + 1} of {articles.length}
                            </span>
                          </div>
                          <CardTitle className="text-2xl md:text-3xl font-serif leading-tight text-wrap">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="text-base font-light text-wrap">
                            {article.summary}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                          <a href={article.url} target="_blank" rel="noreferrer">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                          </a>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full h-[600px] md:h-[800px] bg-background relative border-t border-b">
                        <iframe
                          src={article.url}
                          title={`${article.source} - ${article.title}`}
                          className="w-full h-full"
                          loading="lazy"
                          allowFullScreen
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-12 pointer-events-none" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 bg-muted/10 flex justify-between items-center">
                      <p className="text-xs text-muted-foreground font-mono">
                        Source: {new URL(article.url).hostname}
                      </p>
                      <Button variant="link" size="sm" asChild>
                        <a href={article.url} target="_blank" rel="noreferrer">
                          Open Original <ArrowRight className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-2xl border bg-card shadow-sm p-4 md:p-6 space-y-4 max-w-5xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-xl font-serif font-medium">Ask Questions</h3>
              <p className="text-sm text-muted-foreground font-light">
                Confused about a concept? Ask the assistant to clarify, summarize, or compare ideas from the article.
              </p>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/30 overflow-hidden">
            <Chat embedded />
          </div>
        </motion.div>
      </div>
    </div>
  );
}


