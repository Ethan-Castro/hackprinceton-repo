"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Leaf, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Search, 
  Code, 
  Book,
  ChevronDown,
  AlertCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Interfaces
interface CreditsData {
  balance: string;
  total_used: string;
}

interface GenerationData {
  id: string;
  total_cost: number;
  usage: number;
  created_at: string;
  model: string;
  is_byok: boolean;
  provider_name: string;
  streamed: boolean;
  latency: number;
  generation_time: number;
  tokens_prompt: number;
  tokens_completion: number;
  native_tokens_prompt: number;
  native_tokens_completion: number;
  native_tokens_reasoning: number;
  native_tokens_cached: number;
}

interface StoredGeneration {
  id: number;
  generation_id: string;
  model: string | null;
  provider_name: string | null;
  total_cost: number | null;
  tokens_prompt: number | null;
  tokens_completion: number | null;
  latency: number | null;
  generation_time: number | null;
  is_byok: boolean;
  streamed: boolean;
  created_at: string;
}

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

export default function ImpactPage() {
  // State
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [generationId, setGenerationId] = useState("");
  const [generations, setGenerations] = useState<StoredGeneration[]>([]);
  const [generationsTotal, setGenerationsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationsLoading, setGenerationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    fetchCredits();
    fetchGenerations();
  }, []);

  // Actions
  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/usage/credits");

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenerations = async () => {
    try {
      setGenerationsLoading(true);
      const response = await fetch("/api/usage/generations?limit=100");

      if (!response.ok) {
        throw new Error("Failed to fetch generations");
      }

      const data = await response.json();
      setGenerations(data.generations);
      setGenerationsTotal(data.total);
    } catch (err) {
      console.error("Error fetching generations:", err);
    } finally {
      setGenerationsLoading(false);
    }
  };

  const fetchGeneration = async (id?: string) => {
    const idToFetch = id || generationId.trim();
    if (!idToFetch) return;

    try {
      setGenerationLoading(true);
      setError(null);
      const response = await fetch(`/api/usage/generation?id=${idToFetch}`);

      if (!response.ok) {
        throw new Error("Failed to fetch generation data");
      }

      const result = await response.json();
      setGeneration(result.data);

      // Scroll to generation details
      setTimeout(() => {
        document.getElementById("generation-details")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch generation");
    } finally {
      setGenerationLoading(false);
    }
  };

  // Helpers
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

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
          className="flex flex-col items-start justify-center space-y-5 sm:space-y-6 pt-8 sm:pt-12 pb-8 sm:pb-12 border-b border-border/40"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
              Sustainability
            </Badge>
            <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
              Analytics
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tighter text-foreground">
            Impact <span className="font-serif italic text-muted-foreground">Reports</span>
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl font-light leading-relaxed text-balance">
            Monitor compute resource usage, carbon efficiency, and operational costs across your AI infrastructure.
          </p>

          <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto justify-center" onClick={fetchGenerations}>
              Refresh Data <Activity className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto justify-center" asChild>
              <Link href="/sustainability/carbon">
                Carbon Tracking <Leaf className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Left Column: History & Details */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-8 space-y-8"
          >
            {/* Generation History */}
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Activity Log</h2>
            </div>

            <motion.div variants={item}>
              <Card className="border-none shadow-sm bg-muted/30 overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/5 bg-white/40 dark:bg-black/20">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">Compute Generations</CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {generationsLoading ? "Syncing..." : `Showing ${generations.length} of ${generationsTotal} events`}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {generationsLoading ? (
                     <div className="space-y-4 p-6">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : generations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No activity recorded.</p>
                      <p className="text-xs mt-1">Generations will appear here once processed.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                          <tr>
                            <th className="text-left p-4">ID</th>
                            <th className="text-left p-4">Model</th>
                            <th className="text-left p-4">Provider</th>
                            <th className="text-right p-4">Tokens</th>
                            <th className="text-right p-4">Cost</th>
                            <th className="text-right p-4">Time</th>
                            <th className="text-center p-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {generations.map((gen) => (
                            <tr key={gen.id} className="hover:bg-white/50 dark:hover:bg-black/20 transition-colors">
                              <td className="p-4 font-mono text-xs text-muted-foreground">
                                {gen.generation_id.slice(0, 12)}...
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className="text-[10px] font-normal">{gen.model || "Unknown"}</Badge>
                              </td>
                              <td className="p-4 capitalize text-xs text-muted-foreground">
                                {gen.provider_name || "N/A"}
                              </td>
                              <td className="p-4 text-right font-mono text-xs">
                                {gen.tokens_prompt !== null && gen.tokens_completion !== null
                                  ? (gen.tokens_prompt + gen.tokens_completion).toLocaleString()
                                  : "-"}
                              </td>
                              <td className="p-4 text-right font-mono text-xs text-foreground/80">
                                {gen.total_cost !== null
                                  ? formatCurrency(gen.total_cost)
                                  : "-"}
                              </td>
                              <td className="p-4 text-right text-xs text-muted-foreground">
                                {new Date(gen.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-4 text-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => fetchGeneration(gen.generation_id)}
                                >
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed Lookup */}
            <div className="flex items-center gap-2 border-b pb-4 pt-4 mb-6">
              <Search className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Deep Dive</h2>
            </div>

            <motion.div variants={item}>
              <Card className="border-none shadow-sm bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Transaction Search</CardTitle>
                  <CardDescription>Enter a specific generation ID to view granular metrics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="gen_..."
                      value={generationId}
                      onChange={(e) => setGenerationId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchGeneration()}
                      className="bg-background/80 border-transparent shadow-none focus-visible:ring-1 rounded-full px-4 font-mono text-sm h-11"
                    />
                    <Button 
                      onClick={() => fetchGeneration()} 
                      disabled={generationLoading || !generationId.trim()}
                      className="rounded-full px-6 h-11"
                    >
                      {generationLoading ? "Searching..." : "Analyze"}
                    </Button>
                  </div>

                  {generation && (
                    <div id="generation-details" className="rounded-xl bg-background/50 border border-border/50 p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                             <h3 className="font-semibold text-lg">Transaction Details</h3>
                             <Badge variant={generation.streamed ? "default" : "secondary"} className="text-[10px]">
                              {generation.streamed ? "Streamed" : "Standard"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {generation.id} • {formatDate(generation.created_at)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-sm px-3 py-1">{generation.model}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Cost</p>
                          <p className="text-2xl font-light">{formatCurrency(generation.total_cost)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                           <p className="text-xs uppercase tracking-wider text-muted-foreground">Latency</p>
                           <p className="text-2xl font-light">{generation.latency}ms</p>
                        </div>
                         <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                           <p className="text-xs uppercase tracking-wider text-muted-foreground">Duration</p>
                           <p className="text-2xl font-light">{generation.generation_time}ms</p>
                        </div>
                      </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-3">
                           <h4 className="text-sm font-medium flex items-center gap-2">
                             <Zap className="h-4 w-4 text-primary" /> Token Usage
                           </h4>
                           <div className="space-y-2 text-sm">
                             <div className="flex justify-between py-2 border-b border-border/30">
                               <span className="text-muted-foreground">Prompt</span>
                               <span className="font-mono">{generation.tokens_prompt.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between py-2 border-b border-border/30">
                               <span className="text-muted-foreground">Completion</span>
                               <span className="font-mono">{generation.tokens_completion.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between py-2">
                               <span className="text-muted-foreground">Total</span>
                               <span className="font-mono font-medium">{(generation.tokens_prompt + generation.tokens_completion).toLocaleString()}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className="space-y-3">
                           <h4 className="text-sm font-medium flex items-center gap-2">
                             <Code className="h-4 w-4 text-primary" /> Provider Specs
                           </h4>
                           <div className="space-y-2 text-sm">
                             <div className="flex justify-between py-2 border-b border-border/30">
                               <span className="text-muted-foreground">Service</span>
                               <span className="capitalize">{generation.provider_name}</span>
                             </div>
                             <div className="flex justify-between py-2 border-b border-border/30">
                               <span className="text-muted-foreground">BYOK Status</span>
                               <span>{generation.is_byok ? "Active" : "Disabled"}</span>
                             </div>
                             {generation.native_tokens_reasoning > 0 && (
                               <div className="flex justify-between py-2">
                                 <span className="text-muted-foreground">Reasoning Tokens</span>
                                 <span className="font-mono">{generation.native_tokens_reasoning.toLocaleString()}</span>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* API Docs Section */}
            <div className="flex items-center gap-2 border-b pb-4 pt-4 mb-6">
              <Book className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Developer Resources</h2>
            </div>

            <motion.div variants={item}>
              <Card className="border-none shadow-sm bg-muted/30">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Usage API</h3>
                      <p className="text-xs text-muted-foreground mt-1">Programmatic access to consumption data</p>
                    </div>
                    <code className="bg-background/50 px-3 py-1 rounded text-xs font-mono">
                      GET /v1/credits
                    </code>
                  </div>
                  <div className="grid gap-2">
                     <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-auto py-3 text-xs">
                          <span className="font-mono">GET /credits</span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                         <pre className="bg-background/50 p-3 rounded-lg text-[10px] font-mono overflow-x-auto">
{`// Response
{
  "balance": "95.50",
  "total_used": "4.50"
}`}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                         <Button variant="outline" className="w-full justify-between h-auto py-3 text-xs">
                          <span className="font-mono">GET /generation</span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </CollapsibleTrigger>
                       <CollapsibleContent className="pt-2">
                         <pre className="bg-background/50 p-3 rounded-lg text-[10px] font-mono overflow-x-auto">
{`// Request
GET /v1/generation?id=gen_123...

// Response
{
  "data": {
    "id": "gen_123",
    "total_cost": 0.0012,
    ...
  }
}`}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>

          {/* Right Column: Summary Stats */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-4 space-y-8"
          >
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Executive Summary</h2>
            </div>

             <motion.div variants={item}>
               <Card className="hover:shadow-md transition-shadow duration-300 border-none bg-muted/30">
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase">Available</Badge>
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Credit Balance</p>
                      {loading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <h3 className="text-3xl font-light tracking-tight">
                          {credits ? formatCurrency(credits.balance) : "$0.00"}
                        </h3>
                      )}
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={item}>
               <Card className="hover:shadow-md transition-shadow duration-300 border-none bg-muted/30">
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase">Total Spend</Badge>
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lifetime Usage</p>
                      {loading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <h3 className="text-3xl font-light tracking-tight">
                          {credits ? formatCurrency(credits.total_used) : "$0.00"}
                        </h3>
                      )}
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={item}>
               <Card className="border-none bg-primary/5">
                 <CardHeader>
                   <CardTitle className="text-base">Sustainability Impact</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Carbon Offset</span>
                     <span className="font-medium">12.5 kg</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Green Energy</span>
                     <span className="font-medium">84%</span>
                   </div>
                   <div className="mt-4 pt-4 border-t border-border/10 text-xs text-muted-foreground leading-relaxed">
                     Your AI infrastructure is running on 84% renewable energy sources, contributing to a cleaner compute environment.
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
