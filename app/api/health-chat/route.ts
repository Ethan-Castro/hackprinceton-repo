import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS, CEREBRAS_MODELS } from "@/lib/constants";
import { gateway } from "@/lib/gateway";
import { cerebras } from "@/lib/cerebras";
import { tools } from "@/lib/tools";
import { healthTools } from "@/lib/health-tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    modelId = DEFAULT_MODEL,
  }: { messages: UIMessage[]; modelId: string } = await req.json();

  if (!SUPPORTED_MODELS.includes(modelId)) {
    return new Response(
      JSON.stringify({ error: `Model ${modelId} is not supported` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const isCerebrasModel = CEREBRAS_MODELS.includes(modelId);
  const model = isCerebrasModel ? cerebras(modelId) : gateway(modelId);

  const result = streamText({
    model,
    system: `You are a helpful health and fitness coach. Provide educational guidance only—do not diagnose or prescribe. If users report concerning symptoms, advise contacting a licensed professional or emergency services as appropriate.

Capabilities:
- Explain medical report text with clear lay explanations and definitions
- Create tailored fitness plans and structure them as an ebook-style artifact
- Perform deep research, summarize trusted sources, and provide citations
- Propose personal trackers and entries to support goals

Tools:
- Use displayArtifact for well-structured plans, reports, and ebooks (downloadable-friendly)
- Use displayWebPreview to show relevant webpages
- Use generateHtmlPreview for small interactive widgets or dashboards

Style:
- Be concise, structured, and actionable
- Include brief disclaimers when interpreting medical content
- Encourage healthy habits and safety
`,
    messages: convertToModelMessages(messages),
    tools: { ...tools, ...healthTools },
    onError: (e) => {
      console.error("Error while streaming (health chat).", e);
    },
  });

  const supportsReasoning = modelId.includes("thinking") || modelId.includes("deepseek");

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}


