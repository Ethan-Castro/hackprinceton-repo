"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateStaticSiteHtml } from "@/components/open-lovable/generateStaticSite";
import { toast } from "react-hot-toast";

const STYLE_PRESETS = [
  { id: "modern", name: "Modern" },
  { id: "playful", name: "Playful" },
  { id: "professional", name: "Professional" },
  { id: "artistic", name: "Artistic" },
];

type ScrapeData = {
  title?: string;
  description?: string;
  markdown?: string;
};

export default function OpenLovableGenerationPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [instructions, setInstructions] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [progress, setProgress] = useState("Waiting to start");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeData, setScrapeData] = useState<ScrapeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUrl = sessionStorage.getItem("openLovable.targetUrl");
    const storedStyle =
      sessionStorage.getItem("openLovable.selectedStyle") ?? "modern";
    const storedInstructions =
      sessionStorage.getItem("openLovable.instructions") ?? "";

    if (!storedUrl) {
      router.push("/open-lovable");
      return;
    }

    setTargetUrl(storedUrl);
    setSelectedStyle(storedStyle);
    setInstructions(storedInstructions);
    startGeneration(storedUrl, storedStyle, storedInstructions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const hasPreview = useMemo(() => Boolean(previewUrl && generatedCode), [
    previewUrl,
    generatedCode,
  ]);

  const startGeneration = async (
    url: string,
    style: string,
    extra?: string | null,
  ) => {
    setIsLoading(true);
    setError(null);
    setProgress("Scraping site and preparing preview...");

    try {
      const response = await fetch("/api/open-lovable/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, formats: ["markdown", "html"] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to scrape site");
      }

      const description =
        data?.data?.description ||
        createExcerpt(data?.data?.markdown || data?.data?.html || "");

      const html = generateStaticSiteHtml({
        targetUrl: url,
        style: style as any,
        instructions: extra ?? undefined,
        sourceTitle: data?.data?.title,
        sourceDescription: description || undefined,
      });
      setGeneratedCode(html);
      setScrapeData({
        title: data?.data?.title,
        description,
        markdown: data?.data?.markdown,
      });

      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);

      setProgress("Website ready! Preview updated.");
      toast.success("Preview generated.");
    } catch (error) {
      console.error("Generation error", error);
      setProgress("Generation failed");
      setError(
        error instanceof Error ? error.message : "Failed to generate preview",
      );
      toast.error("Something went wrong generating the preview.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!targetUrl.trim()) {
      toast.error("Add a target URL before regenerating.");
      return;
    }
    try {
      sessionStorage.setItem("openLovable.targetUrl", targetUrl.trim());
      sessionStorage.setItem("openLovable.selectedStyle", selectedStyle);
      sessionStorage.setItem("openLovable.instructions", instructions.trim());
    } catch {
      // ignore
    }
    void startGeneration(targetUrl.trim(), selectedStyle, instructions.trim());
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "open-lovable-preview.html";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded.");
  };

  const handleStartOver = () => {
    sessionStorage.removeItem("openLovable.targetUrl");
    sessionStorage.removeItem("openLovable.selectedStyle");
    sessionStorage.removeItem("openLovable.instructions");
    router.push("/open-lovable");
  };

  const createExcerpt = (input?: string) => {
    if (!input) return "";
    const stripped = input.replace(/[#*>`_-]/g, "").replace(/\s+/g, " ").trim();
    return stripped.length > 220 ? `${stripped.slice(0, 220)}…` : stripped;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Generation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preview the reimagined site, tweak the inputs, and download the
            static HTML.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <Button
                    key={style.id}
                    type="button"
                    variant={
                      selectedStyle === style.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    {style.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                rows={4}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Add notes to influence the mock layout."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleRegenerate} disabled={isLoading}>
                {isLoading ? "Generating..." : "Regenerate preview"}
              </Button>
              <Button variant="secondary" onClick={() => router.push("/open-lovable/builder")}>
                Open builder
              </Button>
              <Button variant="ghost" onClick={handleStartOver}>
                Start over
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">Status: {progress}</p>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A static mock generated from your selections.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!hasPreview}
                  >
                    Download HTML
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[520px] rounded-lg border bg-muted p-2">
                {hasPreview ? (
                  <iframe
                    src={previewUrl}
                    className="h-full w-full rounded border"
                    title="Open Lovable preview"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {isLoading ? "Generating preview..." : "No preview yet."}
                  </div>
                )}
              </CardContent>
            </Card>
            {scrapeData && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Scraped details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Pulled from Firecrawl to guide the mock layout.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">
                      {scrapeData.title || "Untitled"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scrapeData.description || "No description available."}
                    </p>
                  </div>
                  {scrapeData.markdown && (
                    <details className="rounded border bg-muted/50 p-3 text-sm text-muted-foreground">
                      <summary className="cursor-pointer text-foreground">
                        View markdown excerpt
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs">
                        {scrapeData.markdown.slice(0, 1500)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            )}
            {error && (
              <p className="mt-2 text-sm text-destructive">Error: {error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
