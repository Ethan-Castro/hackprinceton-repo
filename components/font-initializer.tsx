"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyFontSelection, isCustomFont } from "@/lib/font-preferences";

/**
 * Re-applies the saved custom font on initial load and every route change,
 * ensuring typography stays consistent across all pages (even those without the ThemeToggle).
 */
export function FontInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    const savedCustomFont = typeof localStorage !== "undefined" ? localStorage.getItem("custom-font") : null;
    applyFontSelection(isCustomFont(savedCustomFont) ? savedCustomFont : null);
  }, [pathname]);

  return null;
}
