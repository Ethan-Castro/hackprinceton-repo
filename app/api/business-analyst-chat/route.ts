import { convertToModelMessages, streamText, type UIMessage, stepCountIs } from "ai";
import {
  CEREBRAS_MODELS,
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
} from "@/lib/constants";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
import { tools } from "@/lib/tools";
import { businessTools } from "@/lib/business-tools";

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
  const cleanedModelId = isCerebrasModel
    ? modelId.replace(/^cerebras\//, "")
    : modelId;
  const model = isCerebrasModel
    ? createCerebras({
        apiKey: process.env.CEREBRAS_API_KEY,
      })(cleanedModelId)
    : gateway(modelId);
  const useTools = true; // All models support tools

  // Merge all tools: base tools + business tools
  const allTools = useTools
    ? {
        ...tools,
        ...businessTools,
      }
    : undefined;

  const capabilityLines = [
    "- Analyze business data, trends, and metrics",
    "- Execute Python code for data science tasks (statistics, modeling, visualization)",
    "- Query databases with SQL to retrieve and analyze business data",
    "- Create visual diagrams and flowcharts to represent business processes",
    "- Generate charts and reports from data analysis",
    "- Search and retrieve information from the web",
    "- Scrape websites for market research and competitive analysis",
  ];

  const styleLines = [
    "- Be data-driven and evidence-based in all recommendations",
    "- Provide clear explanations of analysis methods and assumptions",
    "- Include visualizations and diagrams to support findings",
    "- Offer actionable insights and business recommendations",
    "- Cite sources when providing external data",
  ];

  const systemSections: string[] = [
    `You are an expert business analyst with access to advanced data analysis, visualization, and web research tools. You help organizations understand their data, identify trends, and make informed business decisions.${
      useTools
        ? " You have access to specialized tools for data analysis, database querying, visualization, and web research."
        : " Provide analysis and recommendations using standard business methodology."
    }`,
    `Capabilities:\n${capabilityLines.join("\n")}`,
  ];

  if (useTools) {
    systemSections.push(
      `Tools Available:
- Python Code Execution: Execute Python code with NumPy, Pandas, Matplotlib, Seaborn, and Scikit-learn for data analysis and visualization
- SQL Query Execution: Execute SELECT queries against the PostgreSQL database with automatic safety constraints
- Table Schema Discovery: Describe database tables and retrieve schema information
- Diagram Generation: Create flowcharts, sequence diagrams, ER diagrams, mind maps, and other Mermaid diagrams
- Chart Generation: Generate bar, line, area, pie, and scatter charts from data
- Web Search: Search the web for market data, competitor information, and industry trends
- Website Scraping: Extract content from websites for research and analysis
- Parallel Agent: Run complex analysis tasks using parallel processing
- Business Analysis Tools: Access specialized business analysis and market research capabilities`
    );
  }

  systemSections.push(`Style:\n${styleLines.join("\n")}`);

  const system = systemSections.join("\n\n");

  const result = streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
    ...(useTools && allTools ? { tools: allTools, stopWhen: stepCountIs(10) } : {}),
    onStepFinish: ({ toolCalls, toolResults }) => {
      if (!useTools) {
        return;
      }
      // Log tool usage for debugging
      if (toolCalls && toolCalls.length > 0) {
        console.log('[Business Analyst Chat] Tool calls:', toolCalls.map(tc => ({
          name: tc.toolName,
          input: 'input' in tc ? tc.input : undefined
        })));
      }
      if (toolResults && toolResults.length > 0) {
        console.log('[Business Analyst Chat] Tool results:', toolResults.map(tr => ({
          tool: tr.toolName,
          success: 'result' in tr
        })));
      }
    },
    onError: (e) => {
      console.error("Error while streaming (business analyst chat).", e);
    },
  });

  const supportsReasoning = modelId.includes("thinking") || modelId.includes("deepseek");

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}
