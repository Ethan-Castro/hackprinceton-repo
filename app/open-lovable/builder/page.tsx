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

export default function OpenLovableBuilderPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [instructions, setInstructions] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("Waiting for inputs");
  const [error, setError] = useState<string | null>(null);
  const [scrapeDescription, setScrapeDescription] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const storedUrl = sessionStorage.getItem("openLovable.targetUrl");
    const storedStyle =
      sessionStorage.getItem("openLovable.selectedStyle") ?? "modern";
    const storedInstructions =
      sessionStorage.getItem("openLovable.instructions") ?? "";

    if (storedUrl) {
      setTargetUrl(storedUrl);
      setSelectedStyle(storedStyle);
      setInstructions(storedInstructions);
      void renderPreview(storedUrl, storedStyle, storedInstructions);
    }
  }, []);

  const hasPreview = useMemo(() => Boolean(previewUrl && generatedCode), [
    previewUrl,
    generatedCode,
  ]);

  const renderPreview = async (url: string, style: string, extra?: string) => {
    setIsGenerating(true);
    setError(null);
    setProgress("Scraping and building HTML preview...");

    try {
      const response = await fetch("/api/open-lovable/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, formats: ["markdown", "html"] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Scrape failed");
      }
      const description =
        data?.data?.description ||
        createExcerpt(data?.data?.markdown || data?.data?.html || "");
      setScrapeDescription(description || null);

      const html = generateStaticSiteHtml({
        targetUrl: url,
        style: style as any,
        instructions: extra,
        sourceTitle: data?.data?.title,
        sourceDescription: description || undefined,
      });
      setGeneratedCode(html);
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      setProgress("Preview ready");
      toast.success("Preview updated.");
    } catch (error) {
      console.error("Preview error", error);
      setProgress("Something went wrong");
      setError(error instanceof Error ? error.message : "Preview failed");
      toast.error("Could not build preview.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (!targetUrl.trim()) {
      toast.error("Add a target URL to continue.");
      return;
    }
    const normalizedUrl = targetUrl.startsWith("http")
      ? targetUrl.trim()
      : `https://${targetUrl.trim()}`;
    try {
      sessionStorage.setItem("openLovable.targetUrl", normalizedUrl);
      sessionStorage.setItem("openLovable.selectedStyle", selectedStyle);
      sessionStorage.setItem("openLovable.instructions", instructions.trim());
    } catch {
      // ignore storage failures
    }
    void renderPreview(normalizedUrl, selectedStyle, instructions.trim());
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "open-lovable-builder.html";
    anchor.click();
    URL.revokeObjectURL(url);
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
          <CardTitle className="text-xl">Builder</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick playground for the Open Lovable clone builder. Adjust inputs,
            render a fresh preview, and download the HTML.
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
              <Label htmlFor="instructions">Notes</Label>
              <Textarea
                id="instructions"
                rows={4}
                placeholder="Add notes to tweak the mock layout."
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate preview"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownload}
                disabled={!hasPreview}
              >
                Download HTML
              </Button>
              <Button variant="ghost" onClick={() => router.push("/open-lovable")}>
                Back to overview
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">Status: {progress}</p>
            {error && (
              <p className="text-sm text-destructive">Error: {error}</p>
            )}
            {scrapeDescription && (
              <p className="text-sm text-muted-foreground">
                Source insight: {scrapeDescription}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Live preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mock output rendered as an iframe.
                </p>
              </CardHeader>
              <CardContent className="h-[520px] rounded-lg border bg-muted p-2">
                {hasPreview ? (
                  <iframe
                    src={previewUrl}
                    className="h-full w-full rounded border"
                    title="Open Lovable builder preview"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {isGenerating
                      ? "Generating preview..."
                      : "Add inputs and generate to see the preview."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
