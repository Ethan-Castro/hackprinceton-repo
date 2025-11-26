import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createCerebras } from "@ai-sdk/cerebras";

const cerebras = createCerebras({
  apiKey: process.env.CEREBRAS_API_KEY ?? "",
});

const SUPPORTED_MODELS = ["gpt-oss-120b", "zai-glm-4.6"] as const;
const DEFAULT_MODEL = SUPPORTED_MODELS[0];

// System prompt for React component generation - generates JSX that works in browser
const SYSTEM_PROMPT = `You are an expert React developer. Generate COMPLETE, production-ready React components using JavaScript (JSX) and Tailwind CSS.

CRITICAL RULES FOR BROWSER PREVIEW:
1. Generate plain JavaScript/JSX - NO TypeScript (no type annotations, no interfaces, no generics)
2. Do NOT include any import statements - React and hooks are available globally
3. Do NOT use 'use client' directive
4. Use Tailwind CSS for ALL styling
5. Export as: export default function ComponentName() { ... }
6. Make components fully self-contained
7. Include responsive design (mobile-first)
8. Add accessibility attributes

REQUIRED STRUCTURE (NO IMPORTS, NO TYPES):
\`\`\`jsx
export default function ComponentName() {
  const [state, setState] = useState(initialValue);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Component JSX here */}
    </div>
  );
}
\`\`\`

IMPORTANT - DO NOT USE:
- TypeScript type annotations (: string, : number, etc.)
- Generic types like useState<Type>() - just use useState()
- Interface or type declarations
- Import statements
- 'use client' directive

STYLING GUIDELINES:
- Use Tailwind utility classes exclusively
- Modern, clean, professional design
- Good color contrast
- Hover states for interactive elements
- Focus rings for accessibility
- Mobile-responsive (sm:, md:, lg: breakpoints)

Respond with ONLY the component code wrapped in \`\`\`jsx...\`\`\`.
No explanations, no text before or after. Just the code.`;

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:tsx|ts|jsx|js|javascript)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function cleanComponentCode(content: string): string {
  let cleaned = stripCodeFences(content).trim();
  
  // Remove 'use client' directive
  cleaned = cleaned.replace(/'use client';?\s*/g, '');
  cleaned = cleaned.replace(/"use client";?\s*/g, '');
  
  // Remove all import statements
  cleaned = cleaned.replace(/^import\s+.*$/gm, '');
  
  // Remove TypeScript type declarations (in case AI still generates them)
  cleaned = cleaned.replace(/^type\s+\w+\s*=\s*\{[\s\S]*?\};\s*$/gm, '');
  cleaned = cleaned.replace(/^interface\s+\w+\s*\{[\s\S]*?\}\s*$/gm, '');
  
  // Remove generic type parameters from hooks
  cleaned = cleaned.replace(/useState<[^>]+>/g, 'useState');
  cleaned = cleaned.replace(/useRef<[^>]+>/g, 'useRef');
  cleaned = cleaned.replace(/useCallback<[^>]+>/g, 'useCallback');
  cleaned = cleaned.replace(/useMemo<[^>]+>/g, 'useMemo');
  cleaned = cleaned.replace(/useReducer<[^>]+>/g, 'useReducer');
  cleaned = cleaned.replace(/useContext<[^>]+>/g, 'useContext');
  cleaned = cleaned.replace(/createContext<[^>]+>/g, 'createContext');
  
  // Remove type annotations from arrow function parameters
  cleaned = cleaned.replace(/\((\w+)\s*:\s*[^)]+\)/g, '($1)');
  
  // Remove type annotations from function parameters (simple cases)
  cleaned = cleaned.replace(/:\s*React\.\w+(<[^>]+>)?/g, '');
  cleaned = cleaned.replace(/:\s*(string|number|boolean|null|undefined|void|any)\b/g, '');
  
  // Remove 'as Type' assertions
  cleaned = cleaned.replace(/\s+as\s+\w+/g, '');
  
  // Clean up empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
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

    console.log("[v0-chat] Generating React component with Cerebras model:", normalizedModel);

    const result = await generateText({
      model: cerebras(normalizedModel),
      system: combinedSystem,
      prompt: message,
      temperature: 0.5,
      maxOutputTokens: 4096,
    });

    const componentCode = cleanComponentCode(result.text);
    const responseChatId =
      chatId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cerebras-${Date.now()}`);

    console.log("[v0-chat] Generated React component");
    const encodedCode = Buffer.from(componentCode, "utf8").toString("base64url");
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);
    const demoHttpUrl = `${baseUrl}/api/v0-chat/preview?data=${encodedCode}&id=${encodeURIComponent(responseChatId)}&type=react`;

    // Determine component name from code
    const componentNameMatch = componentCode.match(/export default function (\w+)/);
    const componentName = componentNameMatch ? componentNameMatch[1] : "GeneratedComponent";
    const fileName = `${componentName}.jsx`;

    return NextResponse.json({
      id: responseChatId,
      demo: demoHttpUrl,
      model: `cerebras/${normalizedModel}`,
      files: [
        {
          object: "file",
          name: fileName,
          content: componentCode,
          locked: false,
        },
      ],
      messages: [
        { role: "user", content: message },
        {
          role: "assistant",
          content: "Generated React component. Check the preview panel!",
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
      
      const fallbackHtml = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="p-4 text-red-500"><h1>Generation Failed</h1><p>${error?.message || "Unknown error"}</p></body></html>`;
      const encodedFallback = Buffer.from(fallbackHtml, "utf8").toString("base64url");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);
      const fallbackDemo = `${baseUrl}/api/v0-chat/preview?data=${encodedFallback}&id=${encodeURIComponent(fallbackId)}`;

      return NextResponse.json(
        {
          id: fallbackId,
          demo: fallbackDemo,
          error: "Failed to generate React component with Cerebras",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    } catch {
      return NextResponse.json(
        {
          error: "Failed to generate React component with Cerebras",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}
