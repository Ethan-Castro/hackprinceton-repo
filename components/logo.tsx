"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 32, height = 32, priority = false }: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only showing logo after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which theme to use
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" 
    ? "/Augment Logo dark.png" 
    : "/Augment Logo light.png";

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <div 
        className={cn("bg-muted animate-pulse rounded", className)} 
        style={{ width, height }}
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="Augment Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

