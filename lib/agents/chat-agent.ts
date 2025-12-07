import { Experimental_Agent as Agent, stepCountIs, tool as createTool } from "ai";
import { webSearch as exaWebSearch } from "@exalabs/ai-sdk";
import { z } from "zod";
import { tools } from "@/lib/tools";
import { resolveModel } from "@/lib/agents/model-factory";
import { createToolLogger } from "@/lib/agents/tool-logging";

// Wrap Exa webSearch with error handling to prevent breaking the conversation
function createSafeWebSearch() {
  const originalTool = exaWebSearch({
    type: "auto",
    numResults: 10,
    contents: {
      text: { maxCharacters: 5000 },
      livecrawl: "fallback",
    },
  });

  return createTool({
    description: originalTool.description || "Search the web for up-to-date information",
    inputSchema: z.object({
      query: z.string().describe("The search query"),
    }),
    execute: async ({ query }) => {
      try {
        if (!originalTool.execute) {
          throw new Error("Tool execute function not available");
        }
        return await originalTool.execute({ query }, { toolCallId: "", messages: [] });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[webSearch] Tool error:", errorMessage);
        return {
          error: true,
          message: `Web search failed: ${errorMessage}. Please try rephrasing your query or provide information without web search.`,
        };
      }
    },
  });
}

function buildChatTools() {
  return {
    ...tools,
    webSearch: createSafeWebSearch(),
  };
}

type ChatTools = ReturnType<typeof buildChatTools>;
export type ChatToolName = keyof ChatTools;

export type ChatAgentOptions = {
  enableAllTools?: boolean;
  activeTools?: Array<ChatToolName | string>;
};

const DEFAULT_ACTIVE_TOOLS: ChatToolName[] = [
  "displayArtifact",
  "displayWebPreview",
  "generateHtmlPreview",
  "webSearch",
];

const TOOL_DESCRIPTIONS: Partial<Record<ChatToolName, string>> = {
  displayArtifact: "Show code, documents, or structured content in an artifact container",
  displayWebPreview: "Render a live preview of a URL inside the chat",
  generateHtmlPreview: "Render generated HTML/CSS/JS as a live preview",
  webSearch: "General-purpose web search via Exa",
  generateChart: "Create charts using Recharts",
  generateMermaidDiagram: "Generate Mermaid diagrams",
  generateMermaidFlowchart: "Generate Mermaid flowcharts",
  generateMermaidERDiagram: "Generate Mermaid ER diagrams",
  scrapeWebsite: "Scrape web pages via Firecrawl",
  runParallelAgent: "Execute multiple AI agents in parallel",
  executePython: "Run Python code in a sandbox",
  analyzeDataset: "Analyze datasets with Python",
  executeSQL: "Run SQL queries",
  describeTable: "Describe database table schemas",
  generateTextbookChapter: "Generate textbook content",
  generateExercises: "Generate educational exercises",
  generateDiagram: "Generate educational diagrams",
  generateCodeExample: "Generate educational code examples",
  generateKeyPoints: "Generate educational key points",
  generateCaseStudy: "Generate educational case studies",
  renderTemplateDocument: "Render template-based documents",
  generateMindMap: "Generate mind maps",
  valyuWebSearch: "Alternative real-time web search",
  financeSearch: "Finance and stock data search",
  paperSearch: "Academic paper search",
  bioSearch: "Biomedical and clinical research search",
  patentSearch: "Patent database search",
  secSearch: "SEC filings search",
  economicsSearch: "Economic indicators search",
  companyResearch: "Company research",
  searchArXiv: "Search arXiv papers",
  getArXivPaper: "Retrieve arXiv paper details",
  medicalResearch: "Medical research assistance",
  appointments: "Schedule or manage appointments",
  medications: "Medication lookup and management",
  sendEmail: "Send email via SendGrid",
  voiceAlert: "Trigger a voice alert",
  healthMonitoring: "Health monitoring tools",
  providerInsurance: "Provider insurance lookup",
  dashboardRefresh: "Refresh dashboard data",
};

function buildChatSystemPrompt({
  useTools,
  fullToolAccess,
  activeTools,
}: {
  useTools: boolean;
  fullToolAccess: boolean;
  activeTools?: ChatToolName[];
}) {
  const systemSections: string[] = [
    `# Augment Universal Assistant

You are the universal AI assistant for **Augment** — an AI-powered platform that helps people work smarter across education, healthcare, business, and sustainability. Your role is to be helpful, knowledgeable, and efficient.

## Your Purpose
- Answer questions on any topic with accuracy and clarity
- Help users accomplish tasks quickly and effectively
- Create visualizations, diagrams, and interactive content when helpful
- Search the web and research databases when you need current or specialized information
- Guide users to specialized studios when their needs would be better served there${
      useTools ? "" : "\n- Note: Tools are not available with this model. Provide guidance on manual alternatives."
    }`,

    `## Platform Context

Augment offers specialized AI studios for domain-specific work. Suggest these when relevant:

| Studio | URL | Best For |
|--------|-----|----------|
| Education | /education/studio | Textbooks, lesson plans, quizzes (~2000 tok/s) |
| Healthcare | /health/studio | Medical research, patient education |
| Business | /business/studio | Business plans, market analysis, reports |
| Sustainability | /sustainability/studio | ESG reports, carbon tracking |
| UI Builder | /v0-clone | React components with live preview |`,

    `## Response Style
- **Be direct** — Answer first, context second
- **Be concise** — No filler; respect user's time
- **Be accurate** — Use tools when uncertain
- **Use markdown** — Structure with headings, lists, code blocks; never use Markdown tables—use the HTML table template instead
- **Show, don't tell** — Use charts, diagrams, and previews when they help`,
  ];

  if (useTools) {
    if (fullToolAccess) {
      systemSections.push(
        `## Available Tools

You have **FULL ACCESS** to all tools listed below.

### Search & Research Tools
| Tool | Description | Best For |
|------|-------------|----------|
| **webSearch** | Exa-powered web search with live crawling | General web queries, news, current events |
| **valyuWebSearch** | Valyu real-time web search | Alternative web search, cross-reference results |
| **financeSearch** | Stock prices, earnings, balance sheets, income statements, cash flows, insider transactions | Financial data, stock analysis, company financials |
| **paperSearch** | Full-text search of PubMed, arXiv, bioRxiv, medRxiv scholarly articles | Academic research, scientific papers |
| **bioSearch** | Clinical trials, FDA drug labels, biomedical research | Medical research, drug information, clinical data |
| **patentSearch** | USPTO full-text patent search | Intellectual property, patent research |
| **secSearch** | SEC filings (10-K, 10-Q, 8-K, regulatory disclosures) | Company filings, regulatory disclosures |
| **economicsSearch** | BLS, FRED, World Bank, USAspending economic data | Economic indicators, government data |
| **companyResearch** | Comprehensive company research and intelligence reports | Business intelligence, competitive analysis |
| **searchArXiv / getArXivPaper** | arXiv paper search and retrieval | Physics, math, CS, ML research papers |
| **scrapeWebsite** | Firecrawl web scraping with content extraction | Extract content from specific URLs |

### Visualization & Display Tools
| Tool | Description |
|------|-------------|
| **displayArtifact** | Show code, documents, or structured content in a clean container |
| **displayWebPreview** | Live iframe preview of URLs |
| **generateHtmlPreview** | Render HTML/CSS/JS code as live preview |
| **generateChart** | Create Recharts-based data visualizations (bar, line, pie, area charts) |
| **generateMermaidDiagram** | Create Mermaid diagrams (flowcharts, sequence, state, class diagrams) |
| **generateFlowchart** | Specialized flowchart generation |
| **generateERDiagram** | Entity-relationship diagrams for database design |

### Code & Data Tools
| Tool | Description |
|------|-------------|
| **executePython** | Run Python code via E2B sandbox (data analysis, calculations, file processing) |
| **analyzeDataset** | Analyze data files and generate statistical insights |
| **executeSQL** | Run SQL queries against connected databases |
| **describeTable** | Get schema information for database tables |
| **runParallelAgent** | Execute multiple AI agents in parallel for complex tasks |

### Domain-Specific Tools
| Category | Tools |
|----------|-------|
| **Healthcare** | medicalResearch, appointments, medications, healthMonitoring, providerInsurance |
| **Education** | textbook generators, lesson planning, quiz creation |
| **Business** | business plans, market analysis, reports, templates |
| **Sustainability** | ESG reports, carbon tracking |

### Communication Tools
| Tool | Description |
|------|-------------|
| **sendEmail** | Send emails via SendGrid |
| **voiceAlert** | Send voice alerts via ElevenLabs |

## Parallel Tool Execution

**CRITICAL: You MUST call multiple tools in parallel when they are independent. This is faster and more efficient.**

### When to Use Parallel Tools
- **Multi-topic research**: User asks about multiple subjects → search for each in parallel
- **Cross-referencing**: Need data from multiple sources → query all sources simultaneously
- **Comprehensive analysis**: Comparing companies, papers, or data points → fetch all in parallel
- **Financial research**: Stock data + SEC filings + company research → all in parallel
- **Health research**: Web search + medical papers + clinical trials → all in parallel

### Examples of Parallel Execution
1. "Compare Tesla and Ford financials" → Call \`financeSearch\` for TSLA AND \`financeSearch\` for F in parallel
2. "Research ketogenic diet" → Call \`webSearch\` + \`paperSearch\` + \`bioSearch\` ALL in parallel
3. "Latest AI news and ML papers" → Call \`webSearch\` + \`searchArXiv\` in parallel
4. "Company analysis for Apple" → Call \`financeSearch\` + \`secSearch\` + \`companyResearch\` ALL in parallel
5. "Economic outlook" → Call \`economicsSearch\` for unemployment + inflation + GDP ALL in parallel
6. "Drug interactions for metformin" → Call \`bioSearch\` + \`paperSearch\` + \`webSearch\` ALL in parallel

### How to Execute in Parallel
Call multiple tools in the SAME response. They execute concurrently and you receive all results together. DO NOT wait for one search to complete before starting another.

### Tool Usage Guidelines
1. **Use tools proactively** when they genuinely help the user
2. **ALWAYS execute searches in PARALLEL** when researching multiple topics or sources
3. **Use specialized search tools** — financeSearch for stocks, paperSearch for academic work, bioSearch for medical, etc.
4. **Prefer charts/diagrams** over describing data in text
5. **Use artifacts** for code files, not for short snippets
6. **Combine results** — Run parallel searches, then synthesize and visualize

### Table Formatting (2-column summaries)
- Do not output Markdown tables or pipe-delimited rows; always use the HTML table below with no blank lines before it.
- Keep the header color #f2f2f2, stripes #f9f9f9, borders #ccc, and adjust/add rows while preserving the alternating pattern.
<table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
  <tr style="background:#f2f2f2;">
    <th style="border:1px solid #ccc;padding:5px;">Attribute</th>
    <th style="border:1px solid #ccc;padding:5px;">Details</th>
  </tr>
  <tr>
    <td style="border:1px solid #ccc;padding:5px;">Full name</td>
    <td style="border:1px solid #ccc;padding:5px;">[Full name here]</td>
  </tr>
  <tr style="background:#f9f9f9;">
    <td style="border:1px solid #ccc;padding:5px;">Location</td>
    <td style="border:1px solid #ccc;padding:5px;">[Location here]</td>
  </tr>
  <tr>
    <td style="border:1px solid #ccc;padding:5px;">Education</td>
    <td style="border:1px solid #ccc;padding:5px;">[Education details]</td>
  </tr>
  <tr style="background:#f9f9f9;">
    <td style="border:1px solid #ccc;padding:5px;">Leadership</td>
    <td style="border:1px solid #ccc;padding:5px;">[Leadership info]</td>
  </tr>
  <!-- Add further rows as needed, alternating the background color (no-color, #f9f9f9, no-color, …) -->
</table>.`
      );
    } else {
      const rows =
        activeTools && activeTools.length > 0
          ? activeTools
              .map((toolName) => {
                const description =
                  TOOL_DESCRIPTIONS[toolName] ?? "Available in this chat context";
                return `| **${toolName}** | ${description} |`;
              })
              .join("\n")
          : "| None | No tools explicitly enabled |";

      systemSections.push(
        `## Available Tools

You currently have access to these tools only. Do not claim access to any other tools.

| Tool | Description |
|------|-------------|
${rows}`
      );
    }
  }

  systemSections.push(
    `## Guidelines
1. Answer directly — don't over-explain unless asked
2. Use tools to enhance responses, not as a crutch
3. For research: synthesize clearly, cite sources
4. For code: provide working examples
5. For data: visualize when it helps
6. Suggest studios when they'd serve the user better`
  );

  return systemSections.join("\n\n");
}

export function createChatAgent(
  modelId: string,
  additionalSystemPrompt?: string,
  options: ChatAgentOptions = {}
) {
  const resolved = resolveModel(modelId);

  const chatTools = buildChatTools();
  const allToolNames = Object.keys(chatTools) as ChatToolName[];

  const providedActiveTools =
    Array.isArray(options.activeTools) && options.activeTools.length > 0
      ? options.activeTools.filter((toolName): toolName is ChatToolName =>
          allToolNames.includes(toolName as ChatToolName)
        )
      : undefined;

  const activeTools: ChatToolName[] | undefined = resolved.useTools
    ? providedActiveTools && providedActiveTools.length > 0
      ? providedActiveTools
      : options.enableAllTools
        ? allToolNames
        : DEFAULT_ACTIVE_TOOLS
    : undefined;

  const fullToolAccess =
    resolved.useTools &&
    Array.isArray(activeTools) &&
    activeTools.length === allToolNames.length;

  const baseSettings =
    resolved.useTools
      ? {
          tools: chatTools,
          toolChoice: "auto" as const,
          activeTools,
          maxToolRoundtrips: 5,
          stopWhen: stepCountIs(10),
          onStepFinish: createToolLogger<typeof chatTools>("Chat"),
        }
      : {};

  const baseSystemPrompt = buildChatSystemPrompt({
    useTools: resolved.useTools,
    fullToolAccess,
    activeTools,
  });
  const systemPrompt = additionalSystemPrompt
    ? `${baseSystemPrompt}\n\n${additionalSystemPrompt}`
    : baseSystemPrompt;

  const agent = new Agent({
    model: resolved.model,
    system: systemPrompt,
    ...baseSettings,
  });

  return {
    agent,
    ...resolved,
  };
}
