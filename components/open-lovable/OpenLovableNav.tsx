"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/open-lovable", label: "Overview" },
  { href: "/open-lovable/generation", label: "Generation" },
  { href: "/open-lovable/builder", label: "Builder" },
];

export function OpenLovableNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-3 sm:px-6">
      <div>
        <p className="text-sm text-muted-foreground">Open Lovable</p>
        <h1 className="text-xl font-semibold leading-tight">Website builder</h1>
      </div>
      <div className="flex items-center gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
