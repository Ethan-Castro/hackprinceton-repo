"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { V0Chat } from "@/components/textbook-studio/V0Chat";
import { Loader2 } from "lucide-react";

export default function TextbookStudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    // Allow both authenticated and anonymous users, but guest users get limited features
    if (status === "unauthenticated") {
      router.push("/textbook-studio/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <V0Chat />
    </div>
  );
}
