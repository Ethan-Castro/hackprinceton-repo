"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Zap, Globe, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpeedLightningAnimation } from "@/components/three";

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

const pressClippings = [
  {
    source: "TechCrunch",
    date: "2h ago",
    title: "AI Latency Solved: The New Era of Instant Inference",
    snippet: "Augment's new gateway architecture reduces test-time compute delays by 60%, creating a seamless flow for complex reasoning tasks..."
  },
  {
    source: "The Verge",
    date: "4h ago",
    title: "Beyond Prompt Engineering: The Rise of Continuous Augmentation",
    snippet: "Why waiting for your AI to 'think' is becoming a thing of the past. New tools enable parallel processing and instant feedback loops..."
  },
  {
    source: "Wired",
    date: "12h ago",
    title: "Review: Augment Feels Like An Extension of Your Brain",
    snippet: "By minimizing the friction between thought and execution, this platform delivers on the promise of true AI symbiosis..."
  }
];

const executiveReports = [
  {
    id: "REP-2024-884",
    title: "Global Productivity Index",
    metric: "+245%",
    status: "Trending Up",
    icon: TrendingUp,
    description: "Quarterly analysis of AI-augmented workforce efficiency across enterprise sectors."
  },
  {
    id: "REP-2024-912",
    title: "Compute Resource Optimization",
    metric: "12ms",
    status: "Optimal",
    icon: Zap,
    description: "Average response latency breakdown for multi-modal reasoning chains."
  },
  {
    id: "REP-2024-991",
    title: "Market Intelligence Pulse",
    metric: "High",
    status: "Active",
    icon: Globe,
    description: "Real-time synthesis of global market signals and competitor movements."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start justify-center space-y-5 sm:space-y-6 pt-8 sm:pt-12 md:pt-24 pb-8 sm:pb-12"
        >
          <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
            System Online
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-light tracking-tighter text-foreground">
            Augment <span className="font-serif italic text-muted-foreground">Intelligence</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl font-light leading-relaxed text-balance">
            Eliminate the downtime between thought and action. A unified workspace for frictionless, high-performance AI collaboration.
          </p>
          <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto justify-center" asChild>
              <Link href="/chat">
                Initialize Workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto justify-center" asChild>
              <Link href="/playground">
                View Documentation
              </Link>
            </Button>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Press Clippings Column */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Press Briefings</h2>
            </div>
            
            <div className="columns-1 gap-6 space-y-6">
              {pressClippings.map((clip, i) => (
                <motion.div key={i} variants={item} className="break-inside-avoid">
                  <Card className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors duration-300 cursor-default">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold tracking-wider text-primary">{clip.source}</span>
                        <span className="text-xs text-muted-foreground font-mono">{clip.date}</span>
                      </div>
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-serif leading-tight">{clip.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground font-serif italic leading-relaxed">
                        &ldquo;{clip.snippet}&rdquo;
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                       <Button variant="link" className="px-0 text-xs text-muted-foreground hover:text-primary">Read Full Article</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
              
              {/* Decorative "More" placeholder */}
              <motion.div variants={item} className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm font-mono opacity-50">
                + 12 MORE UPDATES
              </motion.div>
            </div>
          </motion.div>

          {/* Executive Reports Column */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="lg:col-span-5 space-y-6 sm:space-y-8"
            >
             <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Executive Reports</h2>
            </div>

            <div className="space-y-4">
              {executiveReports.map((report, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <report.icon className="h-4 w-4 text-primary" />
                            <span className="text-xs font-mono text-muted-foreground">{report.id}</span>
                          </div>
                          <h3 className="font-medium text-foreground">{report.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 sm:max-w-[260px]">
                            {report.description}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-2xl font-light tracking-tight">{report.metric}</div>
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Interactive Widget Placeholder */}
            <motion.div 
              variants={item}
              className="mt-8 p-5 sm:p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-24 w-24" />
              </div>
              <h3 className="text-lg font-medium mb-2">System Status</h3>
              <div className="space-y-3 font-mono text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway</span>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reasoning</span>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latency</span>
                  <span>42ms</span>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Time Saved / Workflows Changed / Innovation */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="pb-12 sm:pb-16 space-y-6 sm:space-y-8"
        >
          <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">
              Impact Dashboard
            </h2>
            <span className="text-xs font-mono text-muted-foreground/70">
              Time Saved · Workflows Changed · Innovation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Time Saved */}
            <motion.div variants={item}>
              <Card className="h-full border-none shadow-sm bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">
                      TIME SAVED
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif">
                    Operational Latency Removed
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Reserve this surface for metrics, case studies, or narratives on time reduction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[140px] sm:min-h-[180px] rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
                    {/* Time Saved articles / charts / embeds go here */}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Workflows Changed */}
            <motion.div variants={item}>
              <Card className="h-full border-none shadow-sm bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">
                      WORKFLOWS CHANGED
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif">
                    From Linear Tasks to Live Systems
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Use this canvas for workflow diagrams, before/after stories, and internal runbooks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[140px] sm:min-h-[180px] rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
                    {/* Workflows Changed articles / diagrams / embeds go here */}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Innovation */}
            <motion.div variants={item}>
              <Card className="h-full border-none shadow-sm bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">
                      INNOVATION
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif">
                    New Capabilities Unlocked
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Allocate this area for innovation briefs, feature launches, and speculative explorations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[140px] sm:min-h-[180px] rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
                    {/* Innovation-focused articles / launches / embeds go here */}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Three.js Lightning Animation - Bottom of Page */}
        <SpeedLightningAnimation className="mb-8" />

      </div>
    </div>
  );
}
