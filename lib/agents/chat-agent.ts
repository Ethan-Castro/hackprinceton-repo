import { Experimental_Agent as Agent, stepCountIs } from "ai";
import { webSearch } from "@exalabs/ai-sdk";
import { tools } from "@/lib/tools";
import { resolveModel } from "@/lib/agents/model-factory";
import { createToolLogger } from "@/lib/agents/tool-logging";

function buildChatTools() {
  return {
    ...tools,
    webSearch: webSearch({
      type: "auto",
      numResults: 5,
      contents: {
        text: { maxCharacters: 2000 },
        livecrawl: "fallback",
      },
    }),
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

function buildChatSystemPrompt({
  useTools,
  fullToolAccess,
}: {
  useTools: boolean;
  fullToolAccess: boolean;
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
- **Use markdown** — Structure with headings, lists, code blocks
- **Show, don't tell** — Use charts, diagrams, and previews when they help`,
  ];

  if (useTools) {
    systemSections.push(
      `## Available Tools

${fullToolAccess ? `### Full Toolbelt
- **Research & scraping**: webSearch, runParallelAgent, searchArXiv/getArXivPaper, scrapeWebsite, firecrawl, Google Docs readers, Gamma exports
- **Visualization & design**: generateChart, generateMermaidDiagram/Flowchart/ERDiagram, canvas tools, generateHtmlPreview, displayWebPreview
- **Code & data**: executePython/analyzeDataset, executeSQL/describeTable, runParallelAgent, dashboard builders
- **Content & documents**: displayArtifact, textbook generators, business analysis tools, template renderers
- **Health & operations**: medical research suite, appointments, medications, health monitoring, provider/insurance checks
- **Notifications**: SendGrid email flows and ElevenLabs voice alerts

Use any combination of tools that moves the task forward.` : `### Core Tools
- **displayArtifact / displayWebPreview / generateHtmlPreview** — Show results with clean previews
- **webSearch** — Search the web for current information

Use these proactively when they add value.`}

### Tool Usage Guidelines
1. **Use tools proactively** when they genuinely help the user
2. **One web search per turn** unless the user asks for multiple topics
3. **Prefer charts/diagrams** over describing data in text
4. **Use artifacts** for code files, not for short snippets
5. **Combine tools** when appropriate (e.g., search then visualize)`
    );
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
