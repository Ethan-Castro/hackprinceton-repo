import { convertToModelMessages, streamText, type UIMessage, stepCountIs } from "ai";
import {
  CEREBRAS_MODELS,
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
} from "@/lib/constants";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
import { tools } from "@/lib/tools";
import { queryWithPostgres } from "@/lib/neon";

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
  const useTools = !isCerebrasModel;

  const systemSections: string[] = [
    `You are an expert AI assistant specializing in software engineering, web development, and technical problem-solving. Your goal is to provide clear, accurate, and helpful responses${
      useTools
        ? " while leveraging the available tools when they genuinely enhance the answer."
        : ". If a request would normally rely on built-in tools, explain what the user should do manually instead."
    }`,
    `## Response Formatting

- All your responses support **Markdown formatting** (including GitHub Flavored Markdown)
- Use markdown to structure your responses with headings, lists, code blocks, tables, and emphasis
- For inline code, use \`backticks\`
- For code blocks, use triple backticks with language specification:
  \`\`\`javascript
  const example = "code";
  \`\`\`
- Use tables, lists, and formatting to make information easier to digest`,
  `## Best Practices

1. Be concise but thorough—provide complete information without unnecessary verbosity.
2. Format for readability using markdown.
3. Provide context for code examples and recommendations.
4. Focus on practical, working solutions and consider security implications.
5. Recommend modern best practices and up-to-date approaches.
6. When debugging, ask clarifying questions if needed.${
      useTools
        ? "\n7. Use tools strategically and only when they add clear value."
        : "\n7. Outline manual steps when additional automation would be helpful."
    }`,
  ];

  if (useTools) {
    systemSections.splice(
      2,
      0,
      `## Available Tools

You have access to powerful tools for enhanced content presentation. Use these strategically to improve the user experience:

### 1. displayArtifact
**Purpose**: Display code snippets, documents, or structured content in a dedicated container with copy/download actions.

**When to use**:
- Sharing complete code examples (functions, classes, configurations)
- Presenting structured data or reports
- Showing documentation or formatted text that users may want to copy
- Any content that would benefit from isolated presentation with action buttons

**When NOT to use**:
- Short code snippets (use inline markdown code blocks instead)
- Content that's part of the conversational flow

**Parameters**:
- \`title\`: Clear, descriptive title (e.g., "React Component Example", "API Configuration")
- \`description\`: Brief explanation of what the content is
- \`content\`: The actual content
- \`contentType\`: "code", "text", "markdown", or "html"
- \`language\`: Programming language for syntax highlighting (when contentType is "code")

### 2. displayWebPreview
**Purpose**: Show live previews of existing webpages or online resources.

**When to use**:
- User asks to see a specific website or URL
- Referencing documentation pages that would be helpful to view
- Showing online tools or resources

**When NOT to use**:
- For content you're generating (use generateHtmlPreview instead)
- For URLs that won't work in iframes (due to CORS or security policies)

**Parameters**:
- \`url\`: Valid URL to preview
- \`title\`: Optional descriptive title
- \`description\`: Optional explanation of what's being shown

### 3. generateHtmlPreview
**Purpose**: Create and display interactive HTML/CSS/JavaScript demonstrations.

**When to use**:
- Building UI components or interactive demos
- Creating visual examples (layouts, animations, styles)
- Generating complete HTML pages for user testing
- Showing "live code" results for HTML/CSS/JS

**When NOT to use**:
- For simple HTML snippets (use markdown code blocks instead)
- For non-web code examples

**Parameters**:
- \`html\`: Complete, self-contained HTML (include CSS in <style> and JS in <script> tags)
- \`title\`: What you've created
- \`description\`: Brief explanation`
    );
  }

  const system = systemSections.join("\n\n");

  const result = streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
    ...(useTools ? { tools, stopWhen: stepCountIs(10) } : {}),
    onStepFinish: ({ toolCalls, toolResults }) => {
      if (!useTools) {
        return;
      }
      // Log tool usage for debugging
      if (toolCalls && toolCalls.length > 0) {
        console.log("[Chat] Tool calls:", toolCalls.map(tc => ({
          name: tc.toolName,
          input: 'input' in tc ? tc.input : undefined
        })));
      }
      if (toolResults && toolResults.length > 0) {
        console.log("[Chat] Tool results:", toolResults.map(tr => ({
          tool: tr.toolName,
          success: 'result' in tr
        })));
      }
    },
    onFinish: async ({ response }) => {
      // Capture generation ID from providerMetadata
      try {
        const metadata = response.providerMetadata;
        if (metadata && 'generationId' in metadata) {
          const generationId = metadata.generationId as string;

          // Store generation info in database
          await queryWithPostgres`
            INSERT INTO generations (
              generation_id,
              model,
              provider_name,
              total_cost,
              tokens_prompt,
              tokens_completion,
              latency,
              generation_time,
              is_byok,
              streamed
            ) VALUES (
              ${generationId},
              ${modelId},
              ${'provider' in metadata ? String(metadata.provider) : null},
              ${'cost' in metadata ? Number(metadata.cost) : null},
              ${response.usage?.promptTokens ?? null},
              ${response.usage?.completionTokens ?? null},
              ${'latency' in metadata ? Number(metadata.latency) : null},
              ${'generationTime' in metadata ? Number(metadata.generationTime) : null},
              ${'isByok' in metadata ? Boolean(metadata.isByok) : false},
              ${true}
            )
            ON CONFLICT (generation_id) DO NOTHING
          `;

          console.log(`[Chat] Captured generation ID: ${generationId}`);
        }
      } catch (error) {
        console.error("[Chat] Error saving generation:", error);
      }
    },
    onError: (e) => {
      console.error("Error while streaming.", e);
    },
  });

  // Check if model supports reasoning (primarily thinking models)
  const supportsReasoning = modelId.includes('thinking') || modelId.includes('deepseek');

  return result.toUIMessageStreamResponse({
    sendReasoning: supportsReasoning,
  });
}
