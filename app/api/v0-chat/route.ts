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
const SYSTEM_PROMPT = `You are an elite UI/UX designer and React developer. Generate stunning, production-ready React components using JavaScript (JSX) and Tailwind CSS that look like they belong on Dribbble or Awwwards.

TECHNICAL REQUIREMENTS:
1. Plain JavaScript/JSX only - NO TypeScript
2. NO import statements - React and hooks (useState, useEffect, useRef, useMemo, useCallback) are globally available
3. NO 'use client' directive
4. Use Tailwind CSS exclusively for styling
5. Export as: export default function ComponentName() { ... }
6. Self-contained with NO external dependencies, assets, or data fetching
7. Use inline SVGs for icons (simple, elegant paths)

CODE QUALITY RULES:
- Return ONE complete, parseable component - no partial code, ellipses, or TODOs
- All JSX tags must be properly closed
- All strings properly quoted
- Wrap response in single \`\`\`jsx ... \`\`\` block
- Component must be syntactically valid for Babel
- Never truncate or cut off code; finish every attribute value and closing tag. If output might be long, simplify the design instead of stopping early.
- Do not place numbers directly before identifiers (avoid patterns like 80bg-foo)

DESIGN EXCELLENCE GUIDELINES:

Visual Hierarchy:
- Clear focal points with size, color, and spacing contrast
- Typography scale: text-4xl/5xl for heroes, text-xl/2xl for headings, text-base for body
- Generous whitespace - don't crowd elements (p-8, p-12, gap-6, gap-8, space-y-6)

Color & Contrast:
- Use modern, sophisticated palettes (slate, zinc, neutral for bases)
- Strategic accent colors for CTAs and highlights
- Subtle gradients: bg-gradient-to-br from-indigo-500 to-purple-600
- Ensure WCAG AA contrast minimums

Polish & Refinement:
- Smooth transitions: transition-all duration-300 ease-out
- Subtle hover states: hover:scale-[1.02], hover:shadow-lg, hover:-translate-y-1
- Soft shadows: shadow-sm, shadow-md, shadow-xl with shadow-black/5
- Rounded corners consistently: rounded-lg, rounded-xl, rounded-2xl
- Border accents: border border-white/10 or border-gray-200

Layout Patterns:
- Full viewport heroes: min-h-screen with centered content
- Card grids: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Max-width containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Flexbox centering: flex items-center justify-center

Interactive Elements:
- Buttons: px-6 py-3 rounded-lg font-medium with hover/focus states
- Focus rings: focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
- Cursor feedback: cursor-pointer on interactive elements
- Active states: active:scale-95

Responsive Design:
- Mobile-first approach
- Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
- Stack on mobile, grid on desktop
- Appropriate text scaling across breakpoints

Accessibility:
- Semantic HTML (header, main, nav, section, article, button)
- ARIA labels for icon-only buttons
- Role attributes where needed
- Keyboard navigable

COMPONENT STRUCTURE:
\`\`\`jsx
export default function ComponentName() {
  const [state, setState] = useState(initialValue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Component content */}
      </div>
    </div>
  );
}
\`\`\`

OUTPUT: Only the component code in \`\`\`jsx ... \`\`\`. No explanations.`;

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

  // Ensure JSX comments are balanced; if an opening comment is left hanging, close it.
  const openJsxComments = (cleaned.match(/\{\/\*/g) || []).length;
  const closeJsxComments = (cleaned.match(/\*\/\}/g) || []).length;
  if (openJsxComments > closeJsxComments) {
    cleaned = `${cleaned}\n${"*/}".repeat(openJsxComments - closeJsxComments)}`;
  }

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
        maxOutputTokens: 50000,
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
        maxOutputTokens: 50000,
      });
    }

    const componentCode = cleanComponentCode(result?.text ?? "");

    // Check if component code is valid
    let safeComponentCode = componentCode;
    const hasComponent =
      /export default (function|const)\s+\w+/.test(componentCode) &&
      componentCode.includes("return") &&
      !componentCode.includes("```"); // Ensure no markdown fences remain

    if (!hasComponent) {
      console.warn("[v0-chat] Generated code appears malformed, using fallback");
      safeComponentCode = `
export default function GeneratedComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Preview Unavailable</h1>
        <p className="text-gray-600 mb-4">
          The AI generated incomplete code. Please try generating again.
        </p>
        <div className="p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40 text-gray-500 font-mono">
          {/* Debug info for development */}
          Code validation failed.
        </div>
      </div>
    </div>
  );
}`;
    }

    const responseChatId =
      chatId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cerebras-${Date.now()}`);

    console.log("[v0-chat] Generated React component");
    const encodedCode = Buffer.from(safeComponentCode, "utf8").toString("base64url");
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin);
    const demoHttpUrl = `${baseUrl}/api/v0-chat/preview?data=${encodedCode}&id=${encodeURIComponent(responseChatId)}&type=react`;

    // Determine component name from code
    const componentNameMatch = safeComponentCode.match(/export default function (\w+)/);
    const componentName = componentNameMatch ? componentNameMatch[1] : "GeneratedComponent";
    const fileName = `${componentName}.jsx`;

    // Create permanent preview for all users (authenticated or not)
    let permanentPreviewUrl = null;
    try {
      // Get user ID if authenticated, otherwise use null
      const session = await getServerSession(authOptions);
      const userId = session?.user ? (session.user as any).id : null;

      // Generate unique preview ID
      const previewId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `preview-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Create full HTML for permanent storage
      const previewHTML = createPreviewHTML(safeComponentCode, componentName);

      // Store in database (user_id can be null for anonymous users)
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
          safeComponentCode,
          previewHTML,
          usedModelId,
          'active'
        ]
      );

      permanentPreviewUrl = `${baseUrl}/api/preview/${previewId}`;
      console.log("[v0-chat] Created permanent preview:", permanentPreviewUrl);
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
          content: safeComponentCode,
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
