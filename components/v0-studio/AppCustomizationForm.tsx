"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MessageSquare, Settings2, Zap, Monitor, Smartphone, Layers, Paperclip, X, ImageIcon, Globe2, Link2, Palette, ChevronDown, ChevronUp, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModelSpeed = "fast" | "amazing";
export type DeviceFocus = "desktop" | "mobile" | "both";

export interface ImageData {
  data: string; // base64 encoded
  mediaType: string;
  url?: string;
  role?: "inspiration" | "asset";
  name?: string;
  publicId?: string;
}

export interface ExternalDataOptions {
  scrapeUrl?: string;
  searchQuery?: string;
  brandDomain?: string;
}

export interface AppCustomizationFormProps {
  onSubmit: (
    prompt: string,
    model: ModelSpeed,
    images?: ImageData[],
    userPrompt?: string,
    externalData?: ExternalDataOptions
  ) => void;
  title?: string;
  description?: string;
  domain?: string;
  purposePlaceholder?: string;
  freeformPlaceholder?: string;
  themeOptions?: { value: string; label: string }[];
}

// Helper to convert a File to base64 data
async function fileToBase64(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data (remove data:image/xxx;base64, prefix)
      const base64Data = result.split(",")[1];
      resolve({
        data: base64Data,
        mediaType: file.type || "image/png",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const defaultThemeOptions = [
  { value: "light", label: "Light / Clean" },
  { value: "dark", label: "Dark / Modern" },
  { value: "blue", label: "Corporate Blue" },
  { value: "slate", label: "Minimalist Slate" },
];

export function AppCustomizationForm({ 
  onSubmit,
  title = "Build Your App",
  description = "Choose how you want to describe your application.",
  domain = "application",
  purposePlaceholder = "e.g. Dashboard, Tracker, Manager",
  freeformPlaceholder = "Describe what you want to build in your own words...",
  themeOptions = defaultThemeOptions,
}: AppCustomizationFormProps) {
  const [mode, setMode] = useState<"freeform" | "guided">("freeform");
  const [freeformPrompt, setFreeformPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelSpeed>("fast");
  const [uploadingRole, setUploadingRole] = useState<"inspiration" | "asset" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Image upload state (uploaded to Cloudinary + base64 for vision)
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);
  const [inspirationUploads, setInspirationUploads] = useState<
    { url: string; base64: string; mediaType: string; name: string; publicId?: string; role: "inspiration" }[]
  >([]);
  const [assetUploads, setAssetUploads] = useState<
    { url: string; base64: string; mediaType: string; name: string; publicId?: string; role: "asset" }[]
  >([]);
  
  // Guided form state
  const [theme, setTheme] = useState(themeOptions[0]?.value || "light");
  const [deviceFocus, setDeviceFocus] = useState<DeviceFocus>("both");
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [showDataOptions, setShowDataOptions] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandDomain, setBrandDomain] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target.files;
    const role = target.dataset.role as "inspiration" | "asset";
    if (!files || !role) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    void handleUploads(imageFiles, role);

    // Reset file input so same file can be reselected
    target.value = "";
  };

  const handleUploads = async (files: File[], role: "inspiration" | "asset") => {
    setUploadError(null);
    setUploadingRole(role);
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const base64Data = await fileToBase64(file);

          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body });
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.error || "Upload failed");
          }

          return {
            url: json.url as string,
            base64: base64Data.data,
            mediaType: base64Data.mediaType,
            name: file.name,
            publicId: json.publicId as string | undefined,
            role,
          };
        })
      );

      if (role === "inspiration") {
        const inspirationUploadsNext = uploads.map((u) => ({
          ...u,
          role: "inspiration" as const,
        }));
        setInspirationUploads((prev) => [...prev, ...inspirationUploadsNext].slice(0, 2));
      } else {
        const assetUploadsNext = uploads.map((u) => ({
          ...u,
          role: "asset" as const,
        }));
        setAssetUploads((prev) => [...prev, ...assetUploadsNext].slice(0, 6));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
    } finally {
      setUploadingRole(null);
    }
  };

  const removeImage = (role: "inspiration" | "asset", index: number) => {
    if (role === "inspiration") {
      setInspirationUploads((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAssetUploads((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const buildImagePayload = () => {
    const allImages = [...inspirationUploads, ...assetUploads];
    if (allImages.length === 0) return undefined;

    return allImages.map((img) => ({
      data: img.base64,
      mediaType: img.mediaType,
      url: img.url,
      role: img.role,
      name: img.name,
      publicId: img.publicId,
    }));
  };

  const buildDataContext = (): ExternalDataOptions | undefined => {
    const data: ExternalDataOptions = {};
    if (scrapeUrl.trim()) data.scrapeUrl = scrapeUrl.trim();
    if (searchQuery.trim()) data.searchQuery = searchQuery.trim();
    if (brandDomain.trim()) data.brandDomain = brandDomain.trim();
    return Object.keys(data).length ? data : undefined;
  };

  const handleFreeformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (freeformPrompt.trim() || inspirationUploads.length > 0 || assetUploads.length > 0) {
      const prompt = freeformPrompt.trim() || "Create something inspired by the attached images";
      const userPromptPreview = freeformPrompt.trim() || "(No text provided)";
      const imageData = buildImagePayload();
      onSubmit(prompt, selectedModel, imageData, userPromptPreview, buildDataContext());
      setInspirationUploads([]);
      setAssetUploads([]);
      setFreeformPrompt("");
    }
  };

  const handleGuidedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deviceFocusText = deviceFocus === "both" 
      ? "responsive design for both mobile and desktop" 
      : deviceFocus === "mobile" 
        ? "mobile-first design optimized for smartphones" 
        : "desktop-focused design optimized for larger screens";

    const userPromptPreview = [
      purpose && `Purpose: ${purpose}`,
      details && `Details: ${details}`,
      inspiration && `Inspiration: ${inspiration}`,
      extraInfo && `Additional: ${extraInfo}`,
      theme && `Theme: ${theme}`,
      deviceFocusText && `Device focus: ${deviceFocusText}`,
    ]
      .filter(Boolean)
      .join(" | ") || "(No text provided)";
    
    const prompt = `Create a ${domain} with the following specifications:

Purpose: ${purpose}
Theme: ${theme}
Device Focus: ${deviceFocusText}
Details: ${details}
Inspiration: ${inspiration}
Additional Information: ${extraInfo}

Please build this ${domain} with ${deviceFocusText}.`;
    const imageData = buildImagePayload();
    onSubmit(prompt, selectedModel, imageData, userPromptPreview, buildDataContext());
    setInspirationUploads([]);
    setAssetUploads([]);
  };

  const renderImageSection = (
    title: string,
    description: string,
    role: "inspiration" | "asset",
    images: { url: string; name: string; role: "inspiration" | "asset"; mediaType: string; base64: string }[],
    inputRef: React.RefObject<HTMLInputElement | null>,
    max: number
  ) => {
    const isUploading = uploadingRole === role;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>{title}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
            disabled={isUploading}
          >
            <Paperclip className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Attach"}
          </Button>
        </div>

        {images.length > 0 ? (
          <div className="flex gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border border-dashed border-border/50">
            {images.map((img, index) => (
              <div key={`${role}-${img.name}-${index}`} className="relative group/img">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                  <img src={img.url} alt={`${role} ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(role, index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < max && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 transition-colors"
                disabled={isUploading}
              >
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-24 rounded-lg border border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors"
            disabled={isUploading}
          >
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {isUploading ? "Uploading..." : "Click to upload"}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full items-center justify-center bg-muted/10 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Model Speed Selector */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Generation Speed</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedModel === "fast" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModel("fast")}
                className={cn(
                  "flex-1 rounded-full font-medium transition-all",
                  selectedModel === "fast" && "bg-amber-500 hover:bg-amber-600 text-white"
                )}
              >
                <Zap className="mr-2 h-4 w-4" />
                FAST
              </Button>
              <Button
                type="button"
                variant={selectedModel === "amazing" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModel("amazing")}
                className={cn(
                  "flex-1 rounded-full font-medium transition-all",
                  selectedModel === "amazing" && "bg-purple-500 hover:bg-purple-600 text-white"
                )}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AMAZING
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedModel === "fast" 
                ? "Quick generation with good quality results" 
                : "Higher quality output, takes a bit longer"}
            </p>
          </div>

          {/* Shared file inputs so both tabs can trigger uploads */}
          <input
            ref={inspirationInputRef}
            type="file"
            accept="image/*"
            multiple
            data-role="inspiration"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={assetInputRef}
            type="file"
            accept="image/*"
            multiple
            data-role="asset"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4 mb-6">
            {renderImageSection(
              "Website inspiration",
              "Upload 1-2 reference shots to guide layout and style. We’ll describe them with Gemini 2.5 Flash.",
              "inspiration",
              inspirationUploads,
              inspirationInputRef,
              2
            )}
            {renderImageSection(
              "Images to place in the site",
              "Upload visuals that must appear in the generated site (e.g., hero photo, team headshots).",
              "asset",
              assetUploads,
              assetInputRef,
              6
            )}
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
              <button
                type="button"
                onClick={() => setShowDataOptions((prev) => !prev)}
                className="flex w-full items-center justify-between text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  Enrich with external context (optional)
                </span>
                {showDataOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showDataOptions && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-sm">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      Scrape a page (Firecrawl)
                    </Label>
                    <Input
                      placeholder="https://example.com/page-to-scrape"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-sm">
                      <SearchIcon className="h-4 w-4 text-muted-foreground" />
                      Web search query (Firecrawl + Exa)
                    </Label>
                    <Input
                      placeholder="e.g., renewable energy dashboard benchmarks"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-sm">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      Brand assets via brand.dev
                    </Label>
                    <Input
                      placeholder="company.com"
                      value={brandDomain}
                      onChange={(e) => setBrandDomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Uses BRAND_DEV_API_KEY on the server to pull logos, colors, and typography if available.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "freeform" | "guided")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="freeform" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Free-form
              </TabsTrigger>
              <TabsTrigger value="guided" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Guided
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="freeform">
              <form onSubmit={handleFreeformSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="freeform">Describe your {domain}</Label>
                  <Textarea 
                    id="freeform"
                    placeholder={
                      inspirationUploads.length > 0 || assetUploads.length > 0
                        ? "Describe how to use the uploaded images or add extra guidance..."
                        : freeformPlaceholder
                    }
                    value={freeformPrompt}
                    onChange={(e) => setFreeformPrompt(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Inspiration images guide style; site images are placed in the generated layout with alt text.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !freeformPrompt.trim() &&
                    inspirationUploads.length === 0 &&
                    assetUploads.length === 0
                  }
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="guided">
              <form onSubmit={handleGuidedSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Preference</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {themeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deviceFocus">Device Focus</Label>
                    <Select value={deviceFocus} onValueChange={(v) => setDeviceFocus(v as DeviceFocus)}>
                      <SelectTrigger id="deviceFocus">
                        <SelectValue placeholder="Select device focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span>Both (Responsive)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="desktop">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <span>Desktop</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="mobile">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span>Mobile</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input 
                    id="purpose" 
                    placeholder={purposePlaceholder}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="details">Key Features & Details</Label>
                  <Textarea 
                    id="details" 
                    placeholder="Describe the main features and functionality..." 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspiration">Inspiration / Style</Label>
                  <Textarea 
                    id="inspiration" 
                    placeholder="Any existing apps or styles you want to mimic?" 
                    value={inspiration}
                    onChange={(e) => setInspiration(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extraInfo">Additional Information</Label>
                  <Textarea 
                    id="extraInfo" 
                    placeholder="Paste any relevant data or requirements here..." 
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={!purpose}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
