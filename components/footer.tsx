"use client";

import { AnimatedLogoFooter } from "@/components/animated-logo-footer";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <AnimatedLogoFooter />
          <p className="text-sm text-muted-foreground text-center">
            Powered by Augment AI
          </p>
        </div>
      </div>
    </footer>
  );
}

