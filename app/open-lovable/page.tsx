"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

type SearchResult = {
  url: string;
  title: string;
  description: string;
  screenshot: string | null;
  markdown?: string;
};

const STYLE_PRESETS = [
  { id: "modern", name: "Modern", hint: "Gradients, crisp edges" },
  { id: "playful", name: "Playful", hint: "Rounded, colorful" },
  { id: "professional", name: "Professional", hint: "Calm, structured" },
  { id: "artistic", name: "Artistic", hint: "Bold, expressive" },
];

const MODEL_OPTIONS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" },
];

export default function OpenLovableLanding() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);
  const [instructions, setInstructions] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isValidUrl = useMemo(() => {
    if (!targetUrl.trim()) return false;
    try {
      // Basic URL validation – allow missing protocol
      const parsed = new URL(
        targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
      );
      return Boolean(parsed.hostname);
    } catch {
      return false;
    }
  }, [targetUrl]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = targetUrl.trim();

    // If it's a URL, go straight to generation
    if (trimmed && isValidUrl) {
      const normalizedUrl = trimmed.startsWith("http")
        ? trimmed
        : `https://${trimmed}`;

      try {
        sessionStorage.setItem("openLovable.targetUrl", normalizedUrl);
        sessionStorage.setItem("openLovable.selectedStyle", selectedStyle);
        sessionStorage.setItem("openLovable.selectedModel", selectedModel);
        sessionStorage.setItem(
          "openLovable.instructions",
          instructions.trim(),
        );
      } catch {
        // Ignore storage failures (e.g., private mode)
      }

      router.push("/open-lovable/generation");
      return;
    }

    // Otherwise, treat it as a search query
    if (!trimmed) {
      toast.error("Enter a URL or a search query.");
      return;
    }
    performSearch(trimmed);
  };

  const handleUseExample = () => {
    setTargetUrl("https://lovable.dev");
    setInstructions("Keep the playful energy but tighten the hero copy.");
    toast.success("Example prefilled. Ready to generate!");
  };

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setSearchResults([]);
    try {
      const response = await fetch("/api/open-lovable/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Search failed");
      }
      setSearchResults(data.results || []);
      if (!data.results?.length) {
        toast("No results found. Try a different query.");
      }
    } catch (error) {
      console.error("[open-lovable] search error", error);
      toast.error("Search failed. Check FIRECRAWL_API_KEY.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    try {
      sessionStorage.setItem("openLovable.targetUrl", result.url);
      sessionStorage.setItem("openLovable.selectedStyle", selectedStyle);
      sessionStorage.setItem("openLovable.selectedModel", selectedModel);
      sessionStorage.setItem(
        "openLovable.instructions",
        instructions.trim(),
      );
    } catch {
      // Ignore storage errors
    }
    router.push("/open-lovable/generation");
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Open Lovable onboarding</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a site to clone, pick a style, add any instructions, and
            jump into the generation flow.
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                placeholder="https://example.com"
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                autoComplete="url"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Paste any site; we&apos;ll reimagine it with your chosen style.
                Or type a query and search for sites to clone.
              </p>
            </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {MODEL_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant={
                        selectedModel === option.id ? "default" : "outline"
                      }
                      onClick={() => setSelectedModel(option.id)}
                      className="justify-start"
                    >
                      {option.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pick the model you want powering UI generation.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <div className="grid gap-2 md:grid-cols-4">
                {STYLE_PRESETS.map((style) => (
                  <Button
                    key={style.id}
                    type="button"
                    variant={
                      selectedStyle === style.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedStyle(style.id)}
                    className="flex items-start justify-start text-left"
                  >
                    <div>
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {style.hint}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Additional instructions</Label>
              <Textarea
                id="instructions"
                placeholder="e.g., add a pricing section, emphasize accessibility, keep brand colors."
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button type="submit" disabled={!isValidUrl}>
                  Continue to generation
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUseExample}
                >
                  Use example
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Next up: we&apos;ll build a preview and let you download the
                generated HTML.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Search results ({searchResults.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick a result to send it to the generation flow.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {searchResults.map((result) => (
              <button
                key={result.url}
                onClick={() => handleSelectResult(result)}
                className="group flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {result.screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.screenshot}
                      alt={result.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">No shot</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium leading-tight">{result.title}</p>
                    <span className="text-xs text-muted-foreground transition group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {result.description || result.url}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    {result.url}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isSearching && (
        <p className="text-sm text-muted-foreground">
          Searching Firecrawl…
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sections</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each Open Lovable section now has its own page: overview, generation
            preview, and the lightweight builder.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <SectionLink
            title="Generation"
            description="Render a preview from your selections and download the HTML."
            href="/open-lovable/generation"
          />
          <SectionLink
            title="Builder"
            description="Iterate quickly with the mock builder experience."
            href="/open-lovable/builder"
          />
          <SectionLink
            title="Overview"
            description="You’re here. Adjust inputs and jump into the flow."
            href="/open-lovable"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SectionLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        <span className="text-sm text-muted-foreground transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
