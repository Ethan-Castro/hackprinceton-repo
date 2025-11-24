import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createCerebras } from "@ai-sdk/cerebras";

const cerebras = createCerebras({
  apiKey: process.env.CEREBRAS_API_KEY ?? "",
});

const SUPPORTED_MODELS = ["gpt-oss-120b", "zai-glm-4.6"] as const;
const DEFAULT_MODEL = SUPPORTED_MODELS[0];

const SYSTEM_PROMPT = `You are an expert frontend developer. Generate a COMPLETE, self-contained HTML document that can be shown in an iframe WITHOUT a build step.

Rules:
- Use Tailwind via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include full <html>, <head>, and <body> tags
- Keep all CSS/JS in the page (no external assets that need tokens)
- Prefer semantic HTML and accessible attributes
- Add sensible styling, responsive layout, and some interactivity when useful
- Do NOT wrap the response in markdown or code fences`;

function stripCodeFences(text: string) {
  return text
    .replace(/^```(?:html|tsx|jsx)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function ensureHtmlDocument(content: string) {
  const trimmed = content.trim();
  if (/<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Generated UI</title>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-50">
    ${trimmed}
  </body>
</html>`;
}

function createDemoUrl(html: string) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, modelId, system } = await request.json();

    console.log("[v0-chat] Cerebras request received:", {
      preview: message?.slice(0, 80),
      chatId,
      modelId,
    });

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.CEREBRAS_API_KEY) {
      console.error("[v0-chat] CEREBRAS_API_KEY not configured");
      return NextResponse.json(
        {
          error: "CEREBRAS_API_KEY not configured",
          details: "Please add your Cerebras API key to .env.local",
        },
        { status: 500 }
      );
    }

    const normalizedModel =
      typeof modelId === "string" && SUPPORTED_MODELS.includes(modelId as any)
        ? (modelId as (typeof SUPPORTED_MODELS)[number])
        : DEFAULT_MODEL;

    const combinedSystem = system
      ? `${system}\n\n${SYSTEM_PROMPT}`
      : SYSTEM_PROMPT;

    console.log("[v0-chat] Generating UI with Cerebras model:", normalizedModel);

    const result = await generateText({
      model: cerebras(normalizedModel),
      system: combinedSystem,
      prompt: message,
      temperature: 0.5,
      maxOutputTokens: 4096,
    });

    const cleanedHtml = ensureHtmlDocument(stripCodeFences(result.text));
    const demoUrl = createDemoUrl(cleanedHtml);
    const responseChatId =
      chatId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cerebras-${Date.now()}`);

    console.log("[v0-chat] Generated demo URL length:", demoUrl.length);
    const encodedHtml = Buffer.from(cleanedHtml, "utf8").toString("base64url");
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);
    const demoHttpUrl = `${baseUrl}/api/v0-chat/preview?data=${encodedHtml}&id=${encodeURIComponent(responseChatId)}`;

    return NextResponse.json({
      id: responseChatId,
      demo: demoHttpUrl,
      model: `cerebras/${normalizedModel}`,
      files: [
        {
          object: "file",
          name: "index.html",
          content: cleanedHtml,
          locked: false,
        },
      ],
      messages: [
        { role: "user", content: message },
        {
          role: "assistant",
          content: "Generated new app preview. Check the preview panel!",
        },
      ],
    });
  } catch (error: any) {
    console.error("[v0-chat] Error:", error);
    try {
      const fallbackId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `cerebras-${Date.now()}`;
      const fallbackDemo = createDemoUrl("Generation failed. Please retry.");
      return NextResponse.json(
        {
          id: fallbackId,
          demo: fallbackDemo,
          error: "Failed to generate UI with Cerebras",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    } catch {
      return NextResponse.json(
        {
          error: "Failed to generate UI with Cerebras",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}
