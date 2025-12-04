"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" 
    ? "/Augment Logo dark.png" 
    : "/Augment Logo light.png";

  if (!mounted) {
    return (
      <div 
        className={cn("bg-muted animate-pulse rounded", className)} 
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="Augment"
      width={32}
      height={32}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}

