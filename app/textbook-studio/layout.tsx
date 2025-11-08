"use client";

import { SessionProvider } from "next-auth/react";
import { TextbookStudioNav } from "@/components/textbook-studio/TextbookStudioNav";

export default function TextbookStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TextbookStudioNav />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SessionProvider>
  );
}
