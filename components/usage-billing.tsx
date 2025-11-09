"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, DollarSign, TrendingUp, Zap, ChevronDown, Code, Book } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

export function UsageBilling() {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [generationId, setGenerationId] = useState("");
  const [generations, setGenerations] = useState<StoredGeneration[]>([]);
  const [generationsTotal, setGenerationsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationsLoading, setGenerationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
    fetchGenerations();
  }, []);

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Usage & Billing</h2>
        <p className="text-muted-foreground">
          Monitor your Augment credit balance, track usage, and retrieve detailed generation information.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credits Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {credits ? formatCurrency(credits.balance) : "$0.00"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Remaining Augment credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {credits ? formatCurrency(credits.total_used) : "$0.00"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total credits consumed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>
                Recent AI generations tracked from your conversations
              </CardDescription>
            </div>
            <Button onClick={fetchGenerations} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {generationsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No generations tracked yet.</p>
              <p className="text-sm mt-2">Start a conversation to see generation data here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Showing {generations.length} of {generationsTotal} total generations
              </p>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Generation ID</th>
                        <th className="text-left p-3 font-medium">Model</th>
                        <th className="text-left p-3 font-medium">Provider</th>
                        <th className="text-right p-3 font-medium">Tokens</th>
                        <th className="text-right p-3 font-medium">Cost</th>
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-center p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {generations.map((gen) => (
                        <tr key={gen.id} className="hover:bg-muted/50">
                          <td className="p-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {gen.generation_id.slice(0, 20)}...
                            </code>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{gen.model || "N/A"}</Badge>
                          </td>
                          <td className="p-3 capitalize">
                            {gen.provider_name || "N/A"}
                          </td>
                          <td className="p-3 text-right">
                            {gen.tokens_prompt !== null && gen.tokens_completion !== null
                              ? (gen.tokens_prompt + gen.tokens_completion).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-3 text-right">
                            {gen.total_cost !== null
                              ? formatCurrency(gen.total_cost)
                              : "N/A"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(gen.created_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => fetchGeneration(gen.generation_id)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Generation Lookup</CardTitle>
          <CardDescription>
            Search for a specific generation by entering its ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="gen_01ARZ3NDEKTSV4RRFFQ69G5FAV"
              value={generationId}
              onChange={(e) => setGenerationId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchGeneration()}
            />
            <Button onClick={() => fetchGeneration()} disabled={generationLoading || !generationId.trim()}>
              {generationLoading ? "Loading..." : "Lookup"}
            </Button>
          </div>

          {generation && (
            <div id="generation-details" className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generation Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(generation.created_at)}
                  </p>
                </div>
                <Badge variant="outline">{generation.model}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-lg font-semibold">{formatCurrency(generation.total_cost)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="text-lg font-semibold capitalize">{generation.provider_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={generation.streamed ? "default" : "secondary"}>
                      {generation.streamed ? "Streamed" : "Non-streamed"}
                    </Badge>
                    {generation.is_byok && <Badge variant="outline">BYOK</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Latency (TTFT)</span>
                      <span className="font-medium">{generation.latency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Generation Time</span>
                      <span className="font-medium">{generation.generation_time}ms</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prompt Tokens</span>
                      <span className="font-medium">{generation.tokens_prompt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion Tokens</span>
                      <span className="font-medium">{generation.tokens_completion.toLocaleString()}</span>
                    </div>
                    {generation.native_tokens_reasoning > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reasoning Tokens</span>
                        <span className="font-medium">{generation.native_tokens_reasoning.toLocaleString()}</span>
                      </div>
                    )}
                    {generation.native_tokens_cached > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cached Tokens</span>
                        <span className="font-medium">{generation.native_tokens_cached.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>Generation ID: {generation.id}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive API Documentation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <CardTitle>API Documentation</CardTitle>
          </div>
          <CardDescription>
            Complete reference for the AI Gateway Usage & Billing API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base URL */}
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <p className="text-sm text-muted-foreground mb-2">
              The Usage & Billing API is available at the following base URL:
            </p>
            <code className="bg-muted px-3 py-2 rounded block text-sm">
              https://ai-gateway.vercel.sh/v1
            </code>
          </div>

          {/* Supported Endpoints */}
          <div>
            <h3 className="font-semibold mb-2">Supported Endpoints</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">GET</Badge>
                <div>
                  <code className="text-sm">/credits</code>
                  <span className="text-muted-foreground"> - Check your credit balance and usage information</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">GET</Badge>
                <div>
                  <code className="text-sm">/generation</code>
                  <span className="text-muted-foreground"> - Retrieve detailed information about a specific generation</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Credits Endpoint */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>GET /credits - Check Credit Balance</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Endpoint</h4>
                <code className="bg-muted px-3 py-2 rounded block text-sm">
                  GET https://ai-gateway.vercel.sh/v1/credits
                </code>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Example Request (TypeScript)</h4>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`const apiKey = process.env.AI_GATEWAY_API_KEY ||
               process.env.VERCEL_OIDC_TOKEN;

const response = await fetch(
  'https://ai-gateway.vercel.sh/v1/credits',
  {
    method: 'GET',
    headers: {
      Authorization: \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json',
    },
  }
);

const credits = await response.json();
console.log(credits);`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Sample Response</h4>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`{
  "balance": "95.50",
  "total_used": "4.50"
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Response Fields</h4>
                <div className="space-y-2 text-sm">
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">balance</code>
                    <p className="text-muted-foreground">The remaining credit balance</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">total_used</code>
                    <p className="text-muted-foreground">The total amount of credits used</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Generation Endpoint */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>GET /generation - Generation Lookup</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Retrieve detailed information about a specific generation by its ID. This endpoint allows you to
                look up usage data, costs, and metadata for any generation created through the AI Gateway.
                Generation information is available shortly after the generation completes. Note much of this data
                is also included in the providerMetadata field of the chat completion responses.
              </p>

              <div>
                <h4 className="font-semibold text-sm mb-2">Endpoint</h4>
                <code className="bg-muted px-3 py-2 rounded block text-sm">
                  GET https://ai-gateway.vercel.sh/v1/generation?id={"{generation_id}"}
                </code>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Parameters</h4>
                <div className="border-l-2 border-primary pl-3">
                  <code className="font-semibold text-sm">id</code>
                  <Badge variant="destructive" className="ml-2 text-xs">required</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    The generation ID to look up (format: <code>gen_&lt;ulid&gt;</code>)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Example Request (TypeScript)</h4>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`const generationId = 'gen_01ARZ3NDEKTSV4RRFFQ69G5FAV';

const response = await fetch(
  \`https://ai-gateway.vercel.sh/v1/generation?id=\${generationId}\`,
  {
    method: 'GET',
    headers: {
      Authorization: \`Bearer \${process.env.AI_GATEWAY_API_KEY}\`,
      'Content-Type': 'application/json',
    },
  }
);

const generation = await response.json();
console.log(generation);`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Sample Response</h4>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`{
  "data": {
    "id": "gen_01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "total_cost": 0.00123,
    "usage": 0.00123,
    "created_at": "2024-01-01T00:00:00.000Z",
    "model": "gpt-4",
    "is_byok": false,
    "provider_name": "openai",
    "streamed": true,
    "latency": 200,
    "generation_time": 1500,
    "tokens_prompt": 100,
    "tokens_completion": 50,
    "native_tokens_prompt": 100,
    "native_tokens_completion": 50,
    "native_tokens_reasoning": 0,
    "native_tokens_cached": 0
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Response Fields</h4>
                <div className="space-y-3 text-sm">
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">id</code>
                    <p className="text-muted-foreground">The generation ID</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">total_cost</code>
                    <p className="text-muted-foreground">Total cost in USD for this generation</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">usage</code>
                    <p className="text-muted-foreground">Usage cost (same as total_cost)</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">created_at</code>
                    <p className="text-muted-foreground">ISO 8601 timestamp when the generation was created</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">model</code>
                    <p className="text-muted-foreground">Model identifier used for this generation</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">is_byok</code>
                    <p className="text-muted-foreground">Whether this generation used Bring Your Own Key credentials</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">provider_name</code>
                    <p className="text-muted-foreground">The provider that served this generation</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">streamed</code>
                    <p className="text-muted-foreground">Whether this generation used streaming (true for streamed responses, false otherwise)</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">latency</code>
                    <p className="text-muted-foreground">Time to first token in milliseconds</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">generation_time</code>
                    <p className="text-muted-foreground">Total generation time in milliseconds</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">tokens_prompt</code>
                    <p className="text-muted-foreground">Number of prompt tokens</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">tokens_completion</code>
                    <p className="text-muted-foreground">Number of completion tokens</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">native_tokens_prompt</code>
                    <p className="text-muted-foreground">Native prompt tokens (provider-specific)</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">native_tokens_completion</code>
                    <p className="text-muted-foreground">Native completion tokens (provider-specific)</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">native_tokens_reasoning</code>
                    <p className="text-muted-foreground">Reasoning tokens used (if applicable)</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <code className="font-semibold">native_tokens_cached</code>
                    <p className="text-muted-foreground">Cached tokens used (if applicable)</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: October 21, 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
