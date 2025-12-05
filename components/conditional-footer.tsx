"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

// Pages that should NOT show the footer (build/studio pages)
const BUILD_PAGES = [
  "/education/studio",
  "/health/studio",
  "/business/studio",
  "/sustainability/studio",
  "/open-lovable/builder",
  "/experiments",
];

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Check if current path is a build page
  const isBuildPage = BUILD_PAGES.some((page) => pathname?.startsWith(page));
  
  if (isBuildPage) {
    return null;
  }
  
  return <Footer />;
}

