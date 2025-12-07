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
import { Sparkles, MessageSquare, Settings2, Zap, Monitor, Smartphone, Layers, Paperclip, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModelSpeed = "fast" | "amazing";
export type DeviceFocus = "desktop" | "mobile" | "both";

export interface ImageData {
  data: string; // base64 encoded
  mediaType: string;
}

export interface AppCustomizationFormProps {
  onSubmit: (prompt: string, model: ModelSpeed, images?: ImageData[], userPrompt?: string) => void;
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
  
  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  
  // Guided form state
  const [theme, setTheme] = useState(themeOptions[0]?.value || "light");
  const [deviceFocus, setDeviceFocus] = useState<DeviceFocus>("both");
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [extraInfo, setExtraInfo] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    
    // Limit to 3 images max
    setAttachedImages((prev) => [...prev, ...imageFiles].slice(0, 3));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFreeformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (freeformPrompt.trim() || attachedImages.length > 0) {
      // Convert images to base64
      const imageData = await Promise.all(
        attachedImages.map((file) => fileToBase64(file))
      );
      const prompt = freeformPrompt.trim() || "Create something inspired by the attached image";
      const userPromptPreview = freeformPrompt.trim() || "(No text provided)";
      onSubmit(prompt, selectedModel, imageData.length > 0 ? imageData : undefined, userPromptPreview);
      setAttachedImages([]); // Clear after submit
    }
  };

  const handleGuidedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deviceFocusText = deviceFocus === "both" 
      ? "responsive design for both mobile and desktop" 
      : deviceFocus === "mobile" 
        ? "mobile-first design optimized for smartphones" 
        : "desktop-focused design optimized for larger screens";
    
    // Convert images to base64
    const imageData = await Promise.all(
      attachedImages.map((file) => fileToBase64(file))
    );

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
    onSubmit(prompt, selectedModel, imageData.length > 0 ? imageData : undefined, userPromptPreview);
    setAttachedImages([]); // Clear after submit
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

          {/* Shared file input so both tabs can trigger uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

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
                {/* Image Previews */}
                {attachedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border border-dashed border-border/50">
                    {attachedImages.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="relative group/img"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Attached ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {attachedImages.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border border-dashed border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 transition-colors"
                      >
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="freeform">Describe your {domain}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="h-4 w-4" />
                      Attach Image
                    </Button>
                  </div>
                  <Textarea 
                    id="freeform" 
                    placeholder={attachedImages.length > 0 ? "Describe what you want based on the image..." : freeformPlaceholder}
                    value={freeformPrompt}
                    onChange={(e) => setFreeformPrompt(e.target.value)}
                    className="min-h-[200px]"
                  />
                  {attachedImages.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {attachedImages.length} image{attachedImages.length > 1 ? 's' : ''} attached for inspiration
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={!freeformPrompt.trim() && attachedImages.length === 0}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="guided">
              <form onSubmit={handleGuidedSubmit} className="space-y-4">
                {/* Reference Image Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Reference Image (Optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="h-4 w-4" />
                      Attach Image
                    </Button>
                  </div>
                  {attachedImages.length > 0 ? (
                    <div className="flex gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border border-dashed border-border/50">
                      {attachedImages.map((file, index) => (
                        <div
                          key={`guided-${file.name}-${index}`}
                          className="relative group/img"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {attachedImages.length < 3 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-lg border border-dashed border-border/50 bg-muted/20 flex items-center justify-center hover:bg-muted/40 transition-colors"
                        >
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 rounded-lg border border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors"
                    >
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Click to upload reference images</span>
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload screenshots or designs for visual inspiration
                  </p>
                </div>

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
