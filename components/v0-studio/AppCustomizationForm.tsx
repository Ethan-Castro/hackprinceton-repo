"use client";

import { useState } from "react";
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
import { Sparkles, MessageSquare, Settings2, Zap, Monitor, Smartphone, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModelSpeed = "fast" | "amazing";
export type DeviceFocus = "desktop" | "mobile" | "both";

export interface AppCustomizationFormProps {
  onSubmit: (prompt: string, model: ModelSpeed) => void;
  title?: string;
  description?: string;
  domain?: string;
  purposePlaceholder?: string;
  freeformPlaceholder?: string;
  themeOptions?: { value: string; label: string }[];
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
  
  // Guided form state
  const [theme, setTheme] = useState(themeOptions[0]?.value || "light");
  const [deviceFocus, setDeviceFocus] = useState<DeviceFocus>("both");
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [extraInfo, setExtraInfo] = useState("");

  const handleFreeformSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (freeformPrompt.trim()) {
      onSubmit(freeformPrompt.trim(), selectedModel);
    }
  };

  const handleGuidedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deviceFocusText = deviceFocus === "both" 
      ? "responsive design for both mobile and desktop" 
      : deviceFocus === "mobile" 
        ? "mobile-first design optimized for smartphones" 
        : "desktop-focused design optimized for larger screens";
    
    const prompt = `Create a ${domain} with the following specifications:

Purpose: ${purpose}
Theme: ${theme}
Device Focus: ${deviceFocusText}
Details: ${details}
Inspiration: ${inspiration}
Additional Information: ${extraInfo}

Please build this ${domain} with ${deviceFocusText}.`;
    onSubmit(prompt, selectedModel);
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
                    placeholder={freeformPlaceholder}
                    value={freeformPrompt}
                    onChange={(e) => setFreeformPrompt(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!freeformPrompt.trim()}>
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

