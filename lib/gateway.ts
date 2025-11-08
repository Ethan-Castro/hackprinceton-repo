import { createGatewayProvider } from "@ai-sdk/gateway";

export const gateway = createGatewayProvider({
  baseURL:
    process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1/ai",
  apiKey: process.env.AI_GATEWAY_API_KEY,
});
