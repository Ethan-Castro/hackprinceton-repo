"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { OnboardingManager } from "@/components/onboarding/OnboardingManager";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { ConditionalFooter } from "@/components/conditional-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="flex flex-col min-h-screen">
                <div className="fixed left-3 top-3 z-50 md:hidden">
                  <SidebarTrigger className="shadow-border-medium bg-background/90 backdrop-blur-sm border border-border hover:shadow-border-medium" />
                </div>
                <div className="flex-1">
                  {children}
                </div>
                <ConditionalFooter />
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
