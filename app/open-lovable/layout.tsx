"use client";

import { OpenLovableNav } from "@/components/open-lovable/OpenLovableNav";

export default function OpenLovableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <OpenLovableNav />
      <div className="flex-1 overflow-auto bg-muted/30">{children}</div>
    </div>
  );
}
