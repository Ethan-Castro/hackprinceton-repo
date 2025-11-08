"use client";

import { Chat } from "@/components/chat";
import { Suspense } from "react";
import { DEFAULT_MODEL } from "@/lib/constants";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Chat modelId={DEFAULT_MODEL} />
    </Suspense>
  );
}
