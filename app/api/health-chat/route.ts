import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/constants";
import { gateway } from "@/lib/gateway";
import { tools } from "@/lib/tools";
import { healthTools } from "@/lib/health-tools";
import { getHealthMCPTools } from "@/lib/mcp-client";

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

  // Route all models through the AI Gateway
  // Use direct Cerebras for Cerebras models as fallback if gateway fails
  const model = gateway(modelId);

  // Get MCP tools if configured
  const mcpToolsResult = await getHealthMCPTools();
  const mcpTools = mcpToolsResult?.tools || {};

  // Merge all tools: base tools + health tools + MCP tools
  const allTools = {
    ...tools,
    ...healthTools,
    ...mcpTools,
  };

  const result = streamText({
    model,
    system: `You are a helpful health and fitness coach with access to advanced medical research tools. Provide educational guidance only—do not diagnose or prescribe. If users report concerning symptoms, advise contacting a licensed professional or emergency services as appropriate.

Capabilities:
- Explain medical report text with clear lay explanations and definitions
- Create tailored fitness plans and structure them as an ebook-style artifact
- Perform deep research using medical databases, ArXiv papers, and trusted sources
- Summarize research findings and provide citations
- Propose personal trackers and entries to support goals
- Access medical literature, research papers, and health information through specialized tools
- Search and retrieve academic papers from ArXiv
- Read and reference Google Docs content for research

Tools Available:
- displayArtifact: Display well-structured plans, reports, and ebooks (downloadable-friendly)
- displayWebPreview: Show relevant webpages
- generateHtmlPreview: Create small interactive widgets or dashboards
- browseUrl: Fetch and analyze web-based medical information
- saveTrackerEntry: Persist health tracking data
- indexReport: Store medical reports for reference
- searchArXiv: Search for research papers on any topic
- getArXivPaper: Get detailed information about specific ArXiv papers
- readGoogleDoc: Read content from Google Docs (requires authentication)
- getGoogleDocMetadata: Get metadata about Google Docs
${mcpToolsResult ? '- MCP tools: Access advanced health research and medical information' : ''}

Style:
- Be concise, structured, and actionable
- Include brief disclaimers when interpreting medical content
- Cite sources when providing medical information (include ArXiv links when relevant)
- Encourage healthy habits and safety
`,
    messages: convertToModelMessages(messages),
    tools: allTools,
    onStepFinish: ({ toolCalls, toolResults }) => {
      // Log tool usage for debugging
      if (toolCalls && toolCalls.length > 0) {
        console.log('[Health Chat] Tool calls:', toolCalls.map(tc => tc.toolName));
      }
      if (toolResults && toolResults.length > 0) {
        console.log('[Health Chat] Tool results:', toolResults.map(tr => ({
          tool: tr.toolName,
          success: 'result' in tr
        })));
      }
    },
    onFinish: async () => {
      // Clean up MCP client connection
      if (mcpToolsResult) {
        await mcpToolsResult.close();
      }
    },
    onError: (e) => {
      console.error("Error while streaming (health chat).", e);
    },
  });

  const supportsReasoning = modelId.includes("thinking") || modelId.includes("deepseek");

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}


