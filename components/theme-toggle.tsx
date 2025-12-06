"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { applyFontSelection, CustomFont, isCustomFont } from "@/lib/font-preferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CUSTOM_THEMES = [
  { id: "rose", label: "Rose", color: "#fecaca", type: "light" },
  { id: "emerald", label: "Emerald", color: "#bbf7d0", type: "light" },
  { id: "violet", label: "Violet", color: "#ddd6fe", type: "light" },
  { id: "amber", label: "Amber", color: "#451a03", type: "dark" },
  { id: "ocean", label: "Ocean", color: "#082f49", type: "dark" },
] as const;

const CUSTOM_FONTS = [
  { id: "geist", label: "Geist", description: "Modern, clean" },
  { id: "editorial", label: "Editorial", description: "Elegant, editorial" },
  { id: "professional", label: "Professional", description: "Fresh, professional" },
  { id: "creative", label: "Creative", description: "Futuristic, creative" },
  { id: "classic", label: "Classic", description: "Warm, classic" },
  { id: "technical", label: "Technical", description: "Technical, crisp" },
] as const;

type CustomTheme = (typeof CUSTOM_THEMES)[number]["id"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [customFont, setCustomFont] = useState<CustomFont | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if there's a saved custom theme
    const savedCustomTheme = localStorage.getItem("custom-theme") as CustomTheme | null;
    if (savedCustomTheme && CUSTOM_THEMES.some((t) => t.id === savedCustomTheme)) {
      setCustomTheme(savedCustomTheme);
      applyCustomTheme(savedCustomTheme);
    }

    // Check if there's a saved custom font
    const savedCustomFont = localStorage.getItem("custom-font");
    if (isCustomFont(savedCustomFont)) {
      setCustomFont(savedCustomFont);
      applyCustomFont(savedCustomFont);
    } else {
      applyCustomFont(null);
    }
  }, []);

  // Re-apply the chosen font whenever theme changes to ensure color theme switches don't drop font overrides.
  useEffect(() => {
    if (!mounted) return;
    applyFontSelection(customFont ?? null);
  }, [customFont, theme, mounted]);

  const applyCustomTheme = (themeId: CustomTheme | null) => {
    // Remove all custom theme classes
    CUSTOM_THEMES.forEach((t) => {
      document.documentElement.classList.remove(`theme-${t.id}`);
    });

    if (themeId) {
      document.documentElement.classList.add(`theme-${themeId}`);
      localStorage.setItem("custom-theme", themeId);
    } else {
      localStorage.removeItem("custom-theme");
    }
  };

  const applyCustomFont = (fontId: CustomFont | null) => {
    if (fontId) {
      localStorage.setItem("custom-font", fontId);
    } else {
      localStorage.removeItem("custom-font");
    }

    applyFontSelection(fontId);
  };

  const handleCustomTheme = (themeId: CustomTheme) => {
    const themeConfig = CUSTOM_THEMES.find((t) => t.id === themeId);
    if (!themeConfig) return;

    // Set the base theme (light/dark) first
    setTheme(themeConfig.type);
    setCustomTheme(themeId);
    applyCustomTheme(themeId);
  };

  const handleCustomFont = (fontId: CustomFont) => {
    setCustomFont(fontId);
    applyCustomFont(fontId);
  };

  const handleBaseTheme = (baseTheme: "light" | "dark") => {
    setTheme(baseTheme);
    setCustomTheme(null);
    applyCustomTheme(null);
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shadow-border-small bg-background/80 backdrop-blur-sm border-0"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark" || CUSTOM_THEMES.find((t) => t.id === customTheme)?.type === "dark";

  return (
    <div className="flex items-center gap-1">
      {/* Light/Dark Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          handleBaseTheme(isDark ? "light" : "dark");
        }}
        className="h-9 w-9 shadow-border-small hover:shadow-border-medium bg-background/80 backdrop-blur-sm border-0 hover:bg-background hover:scale-[1.02] transition-all duration-150 ease"
      >
        {isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-200 ease-out hover:rotate-90" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-200 ease-out hover:rotate-12" />
        )}
      </Button>

      {/* Custom Theme Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shadow-border-small hover:shadow-border-medium bg-background/80 backdrop-blur-sm border-0 hover:bg-background hover:scale-[1.02] transition-all duration-150 ease"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Color Themes
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Reset to default */}
          <DropdownMenuItem
            onClick={() => handleBaseTheme(isDark ? "dark" : "light")}
            className="gap-2"
          >
            <div className="h-4 w-4 rounded-full border border-border bg-gradient-to-br from-background to-muted" />
            <span>Default</span>
            {!customTheme && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Light Themes
          </DropdownMenuLabel>

          {CUSTOM_THEMES.filter((t) => t.type === "light").map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => handleCustomTheme(t.id)}
              className="gap-2"
            >
              <div
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: t.color }}
              />
              <span>{t.label}</span>
              {customTheme === t.id && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Dark Themes
          </DropdownMenuLabel>

          {CUSTOM_THEMES.filter((t) => t.type === "dark").map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => handleCustomTheme(t.id)}
              className="gap-2"
            >
              <div
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: t.color }}
              />
              <span>{t.label}</span>
              {customTheme === t.id && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font Style Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shadow-border-small hover:shadow-border-medium bg-background/80 backdrop-blur-sm border-0 hover:bg-background hover:scale-[1.02] transition-all duration-150 ease"
          >
            <Type className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Font Styles
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {CUSTOM_FONTS.map((font) => (
            <DropdownMenuItem
              key={font.id}
              onClick={() => handleCustomFont(font.id)}
              className="gap-2 flex-col items-start"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{font.label}</span>
                {(customFont === font.id || (!customFont && font.id === "geist")) && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{font.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
