"use client";

import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Fira_Code,
  DM_Sans,
  JetBrains_Mono,
  Space_Grotesk,
  Space_Mono,
  Libre_Baskerville,
  IBM_Plex_Mono,
  Inter,
  Source_Code_Pro
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Script from "next/script";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { OnboardingManager } from "@/components/onboarding/OnboardingManager";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { FontInitializer } from "@/components/font-initializer";
import { FONT_VARIABLES, FONT_IDS } from "@/lib/font-preferences";

const fontBootstrapScript = `
(function() {
  try {
    const FONT_VARIABLES = ${JSON.stringify(FONT_VARIABLES)};
    const FONT_IDS = ${JSON.stringify(FONT_IDS)};
    const saved = localStorage.getItem("custom-font");
    const fontKey = saved && FONT_IDS.includes(saved) ? saved : "geist";
    const fontConfig = FONT_VARIABLES[fontKey] || FONT_VARIABLES.geist;
    const sansStack = "var(" + fontConfig.sans + "), ui-sans-serif, system-ui, sans-serif";
    const monoStack = "var(" + fontConfig.mono + "), ui-monospace, monospace";

    const apply = () => {
      const html = document.documentElement;
      const body = document.body;
      if (!html || !body) return;

      FONT_IDS.forEach((id) => html.classList.remove("font-" + id));
      html.classList.add("font-" + fontKey);

      [html, body].forEach((el) => {
        el.style.setProperty("--font-sans", "var(" + fontConfig.sans + ")");
        el.style.setProperty("--font-mono", "var(" + fontConfig.mono + ")");
        el.style.fontFamily = sansStack;
        el.dataset.font = fontKey;
      });

      document.querySelectorAll("code, pre, kbd, samp").forEach((node) => {
        node.style.fontFamily = monoStack;
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", apply, { once: true });
    } else {
      apply();
    }
  } catch (error) {
    console.error("Font bootstrap error", error);
  }
})();`;

// Default fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial fonts
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

// Professional fonts
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Creative fonts
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Classic fonts
const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Technical fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Augment</title>
        <meta name="description" content="Your personal AI-powered assistant for health, business, education, and more" />
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#4285f4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Augment" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        {/* Default favicon - will be updated dynamically based on theme */}
        <link rel="icon" type="image/png" href="/Augment Logo light.png" />
        <link rel="apple-touch-icon" href="/Augment Logo light.png" />
        <Script id="font-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: fontBootstrapScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${firaCode.variable} ${dmSans.variable} ${jetBrainsMono.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${libreBaskerville.variable} ${ibmPlexMono.variable} ${inter.variable} ${sourceCodePro.variable} antialiased`}
        suppressHydrationWarning
      >
        <FontInitializer />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <div className="fixed left-3 top-3 z-50 md:hidden">
                  <SidebarTrigger className="shadow-border-medium bg-background/90 backdrop-blur-sm border border-border hover:shadow-border-medium" />
                </div>
                {children}
              </SidebarInset>
            </SidebarProvider>

            {/* Command Palette */}
            <CommandPalette />

            {/* Onboarding */}
            <OnboardingManager />

            {/* Toast Notifications */}
            <Toaster position="top-right" />
            
            {/* Dynamic Favicon */}
            <DynamicFavicon />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
