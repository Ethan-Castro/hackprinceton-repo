"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ProviderStatus = {
  cerebras: boolean;
  gateway: boolean;
} | null;

interface ProvidersWarningProps {
  providers: ProviderStatus;
  className?: string;
}

export function ProvidersWarning({ providers, className }: ProvidersWarningProps) {
  if (!providers) return null;
  const hasAnyProvider = Object.values(providers).some((enabled) => enabled);
  if (hasAnyProvider) return null;

  return (
    <Alert variant="destructive" className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <AlertDescription className="text-sm">
          No AI providers are configured for this deployment. Add either a <code className="px-1 py-0.5 rounded bg-muted border border-muted-foreground/20">CEREBRAS_API_KEY</code> or an <code className="px-1 py-0.5 rounded bg-muted border border-muted-foreground/20">AI_GATEWAY_API_KEY</code> in your Vercel project settings, then redeploy. See <code className="px-1 py-0.5 rounded bg-muted border border-muted-foreground/20">SETUP_INSTRUCTIONS.md</code> for step-by-step guidance.
        </AlertDescription>
      </div>
    </Alert>
  );
}
