import { createGatewayProvider } from "@ai-sdk/gateway";

// Store the latest generation ID (thread-safe for single request)
let latestGenerationId: string | null = null;

// Custom fetch that captures the generation ID from response
const fetchWithGenerationId: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  // Try to capture generation ID from various possible header names
  const generationId =
    response.headers.get('x-generation-id') ||
    response.headers.get('x-vercel-ai-generation-id') ||
    response.headers.get('x-request-id') ||
    response.headers.get('generation-id');

  // Log all headers once for debugging
  const headerEntries = Object.fromEntries(response.headers.entries());
  console.log('[Gateway] All headers:', headerEntries);

  const genFromHeaders =
    generationId && /^gen_[A-Za-z0-9]+/.test(generationId)
      ? generationId
      : Object.values(headerEntries).find(
          (v) => typeof v === "string" && /^gen_[A-Za-z0-9]+/.test(v)
        );

  if (genFromHeaders) {
    latestGenerationId = genFromHeaders as string;
    console.log('[Gateway] Captured generation ID from headers:', genFromHeaders);
  } else if (generationId) {
    console.log('[Gateway] Header candidate not in gen_* format, skipping:', generationId);
  }

  return response;
};

export const gateway = createGatewayProvider({
  baseURL:
    process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1/ai",
  apiKey: process.env.AI_GATEWAY_API_KEY,
  fetch: fetchWithGenerationId,
});

// Export function to get the latest generation ID
export function getLatestGenerationId(): string | null {
  return latestGenerationId;
}

// Export function to clear the generation ID (call before new request)
export function clearGenerationId(): void {
  latestGenerationId = null;
}

// Export function to set the generation ID (can be set from response parsing)
export function setGenerationId(id: string): void {
  latestGenerationId = id;
  console.log('[Gateway] Set generation ID:', id);
}
