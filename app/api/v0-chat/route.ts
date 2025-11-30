import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/neon";

const cerebras = createCerebras({
  apiKey: process.env.CEREBRAS_API_KEY ?? "",
});

const CEREBRAS_MODELS = ["zai-glm-4.6", "gpt-oss-120b", "llama-3.3-70b"] as const;
const GATEWAY_MODELS = ["google/gemini-3-pro", "anthropic/claude-opus-4.5"] as const;
const DEFAULT_CEREBRAS_MODEL = CEREBRAS_MODELS[0];

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

  // Remove ALL remaining code fences (including middle ones)
  cleaned = cleaned.replace(/```(?:tsx|ts|jsx|js|javascript)?/gi, '');

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

  // Remove any comments that contain code fence markers
  cleaned = cleaned.replace(/\/\/.*```.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?```[\s\S]*?\*\//g, '');

  // Clean up empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

function createPreviewHTML(componentCode: string, componentName: string): string {
  // Remove 'export default' to make function globally accessible
  let processedCode = componentCode.replace(/export default function (\w+)/, 'function $1');
  processedCode = processedCode.replace(/export default const (\w+)\s*=/g, 'const $1 =');
  processedCode = processedCode.replace(/export default /g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${componentName} - AI Generated Component</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // Make React hooks available globally
    const { useState, useEffect, useCallback, useMemo, useRef, useReducer, useContext, createContext, Fragment } = React;

    // Component code (export default removed)
    ${processedCode}

    // Render after Babel processes the code above
    setTimeout(function() {
      try {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        if (typeof ${componentName} !== 'undefined') {
          root.render(React.createElement(${componentName}));
        } else {
          document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Component ${componentName} not found</div>';
        }
      } catch (err) {
        console.error('Render error:', err);
        document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: ' + err.message + '</div>';
      }
    }, 200);
  </script>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, modelId, system } = await request.json();

    console.log("[v0-chat] Request received:", {
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

    // Determine if using a gateway model or cerebras model
    const isGatewayModel = modelId && GATEWAY_MODELS.some(m => modelId === m || modelId.includes(m));
    const isCerebrasModel = !isGatewayModel && modelId && modelId.startsWith("cerebras/");

    // Validate API keys
    if (isGatewayModel && !process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        {
          error: "AI_GATEWAY_API_KEY not configured",
          details: "Please add your AI Gateway API key to .env.local",
        },
        { status: 500 }
      );
    }

    if (!isGatewayModel && !process.env.CEREBRAS_API_KEY) {
      console.error("[v0-chat] CEREBRAS_API_KEY not configured");
      return NextResponse.json(
        {
          error: "CEREBRAS_API_KEY not configured",
          details: "Please add your Cerebras API key to .env.local",
        },
        { status: 500 }
      );
    }

    const combinedSystem = system
      ? `${system}\n\n${SYSTEM_PROMPT}`
      : SYSTEM_PROMPT;

    let result;
    let usedModelId;

    if (isGatewayModel) {
      // Use AI Gateway for models like Gemini 3 Pro, Claude Opus, etc.
      usedModelId = modelId;
      console.log("[v0-chat] Generating with Gateway model:", usedModelId);

      result = await generateText({
        model: gateway(usedModelId),
        system: combinedSystem,
        prompt: message,
        temperature: 0.5,
        maxOutputTokens: 4096,
      });
    } else {
      // Use Cerebras for fast models
      const normalizedModel = isCerebrasModel
        ? modelId.replace(/^cerebras\//, "")
        : CEREBRAS_MODELS.includes(modelId as any)
        ? (modelId as (typeof CEREBRAS_MODELS)[number])
        : DEFAULT_CEREBRAS_MODEL;

      usedModelId = `cerebras/${normalizedModel}`;
      console.log("[v0-chat] Generating with Cerebras model:", normalizedModel);

      result = await generateText({
        model: cerebras(normalizedModel),
        system: combinedSystem,
        prompt: message,
        temperature: 0.5,
        maxOutputTokens: 4096,
      });
    }

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

    // Create permanent preview for authenticated users
    let permanentPreviewUrl = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const userId = (session.user as any).id;

        // Generate unique preview ID
        const previewId = typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `preview-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Create full HTML for permanent storage
        const previewHTML = createPreviewHTML(componentCode, componentName);

        // Store in database
        await query(
          `INSERT INTO v0_deployments (
            preview_id, user_id, internal_chat_id, deployment_web_url,
            component_code, component_html, model_used, deployment_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            previewId,
            userId,
            responseChatId,
            `${baseUrl}/api/preview/${previewId}`,
            componentCode,
            previewHTML,
            usedModelId,
            'active'
          ]
        );

        permanentPreviewUrl = `${baseUrl}/api/preview/${previewId}`;
        console.log("[v0-chat] Created permanent preview:", permanentPreviewUrl);
      }
    } catch (previewError) {
      console.error("[v0-chat] Failed to create permanent preview:", previewError);
      // Continue anyway - temporary preview still works
    }

    return NextResponse.json({
      id: responseChatId,
      demo: demoHttpUrl,
      deployment: permanentPreviewUrl ? { webUrl: permanentPreviewUrl } : null,
      model: usedModelId,
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
