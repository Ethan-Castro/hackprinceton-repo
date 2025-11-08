"use client";

import { SessionProvider } from "next-auth/react";
import { V0CloneNav } from "@/components/v0-clone/V0CloneNav";

export default function V0CloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <V0CloneNav />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SessionProvider>
  );
}
