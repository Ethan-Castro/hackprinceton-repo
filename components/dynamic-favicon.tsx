"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DynamicFavicon() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Determine which theme to use
    const currentTheme = theme === "system" ? systemTheme : theme;
    const faviconPath = currentTheme === "dark" 
      ? "/Augment Logo dark.png" 
      : "/Augment Logo light.png";

    // Update favicon link (keep existing, just update href to avoid flash)
    const updateFavicon = () => {
      // Update or create favicon link
      let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        faviconLink.type = "image/png";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconPath;

      // Update or create apple-touch-icon
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleLink) {
        appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        document.head.appendChild(appleLink);
      }
      appleLink.href = faviconPath;
    };

    updateFavicon();
  }, [theme, systemTheme, mounted]);

  return null; // This component doesn't render anything
}

