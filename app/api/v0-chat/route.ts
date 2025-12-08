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

const CEREBRAS_MODELS = ["gpt-oss-120b", "zai-glm-4.6", "llama-3.3-70b"] as const;
const GATEWAY_MODELS = ["google/gemini-3-pro", "anthropic/claude-opus-4.5"] as const;
const DEFAULT_CEREBRAS_MODEL = CEREBRAS_MODELS[0];

// Vision models for image recognition
const VISION_MODEL_FAST = "google/gemini-2.5-flash";
const VISION_MODEL_AMAZING = "google/gemini-3-pro";

// Image description system prompt
const IMAGE_DESCRIPTION_PROMPT = `You are an expert UI/UX designer analyzing a reference image for web development inspiration.

Describe this image in comprehensive detail for a UI developer who will recreate or be inspired by it. Include:

1. **Overall Layout**: Structure, sections, and spatial arrangement
2. **Color Palette**: Primary, secondary, accent colors (use specific color names or hex codes if identifiable)
3. **Typography**: Font styles, sizes, weights, and hierarchy
4. **UI Components**: Buttons, cards, navigation, forms, icons, and their styles
5. **Visual Effects**: Shadows, gradients, borders, rounded corners, animations implied
6. **Imagery & Graphics**: Photos, illustrations, icons, patterns, backgrounds
7. **Spacing & Alignment**: Margins, padding, grid system
8. **Interactive Elements**: Hover states, CTAs, clickable areas
9. **Mood & Aesthetic**: Professional, playful, minimal, bold, etc.
10. **Responsive Hints**: Mobile/desktop considerations visible

Be specific and actionable. A developer should be able to recreate the essence of this design from your description alone.`;

interface ImageData {
  data: string; // base64 encoded
  mediaType: string;
  url?: string;
  role?: "inspiration" | "asset";
  name?: string;
  publicId?: string;
}

// System prompt for React component generation - generates JSX that works in browser
const SYSTEM_PROMPT = `You are an expert React developer. Generate production-ready components using JavaScript (JSX) and Tailwind CSS.

CRITICAL - USER VISION FIRST:
- The user's description is your primary guide - match THEIR vision, not a template
- If they mention colors, styles, or themes - USE THOSE, not defaults
- If they describe a mood (playful, professional, minimal, bold) - reflect that in every choice
- Be creative and unique - no two requests should look the same
- The examples below show CODE QUALITY, not styles to copy

TECHNICAL REQUIREMENTS:
1. Plain JavaScript/JSX only - NO TypeScript
2. NO import statements - React hooks are globally available (useState, useEffect, useRef, useMemo, useCallback)
3. NO 'use client' directive
4. Tailwind CSS exclusively for styling
5. Export as: export default function ComponentName() { ... }
6. Self-contained with NO external dependencies
7. Icons: inline SVG paths only

CODE RULES (STRICT - violations break rendering):
- Return ONE complete component in a single \`\`\`jsx block
- Code fence format EXACTLY: \`\`\`jsx on its own line, then code, then \`\`\` on its own line
- NO text, explanation, or comments outside the code block
- All JSX tags properly closed with matching opening/closing tags
- All string attributes use double quotes: className="..." not className='...'
- Never truncate code - if complex, simplify the design instead
- No partial code, ellipses, comments like "// ... rest of code", or TODOs

SYNTAX REQUIREMENTS (CRITICAL):
- NO TypeScript: no types, interfaces, generics like useState<string>, or "as Type" assertions
- NO import statements of any kind - hooks are global (useState, useEffect, useRef, useMemo, useCallback)
- NO 'use client' or 'use server' directives
- Single root element in return statement (wrap in <> </> or <div> if needed)
- All curly braces, brackets, and parentheses MUST be balanced
- Event handlers: onClick={() => fn()} not onClick={fn}
- Conditional rendering: {condition && <Element />} or {condition ? <A /> : <B />}
- Array mapping: {items.map((item, index) => <Element key={index} />)} - always include key prop
- NO JSX comments that break structure - use {/* comment */} syntax only INSIDE JSX

DESIGN FLEXIBILITY (choose based on user's request):
- Colors: ANY Tailwind colors work - match the user's brand/mood (red, blue, green, purple, orange, pink, etc.)
- Style: minimal, bold, playful, corporate, dark mode, glassmorphic - whatever fits
- Layout: cards, lists, grids, heroes, sidebars - whatever the content needs
- Personality: serious, fun, elegant, techy, warm - read the user's intent

DEFAULT PATTERNS (only if user doesn't specify):
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Responsive: mobile-first with sm:/md:/lg: breakpoints
- Accessibility: semantic HTML, focus states, ARIA labels

EXAMPLE (for code structure only - DO NOT copy the style):
\`\`\`jsx
export default function ExampleComponent() {
  const [active, setActive] = useState(false);

  return (
    <div className="p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Title</h2>
      <button
        onClick={() => setActive(!active)}
        className="px-4 py-2 rounded-lg transition-all"
      >
        {active ? 'Active' : 'Click me'}
      </button>
    </div>
  );
}
\`\`\`

VARIETY IS KEY:
- Coffee shop? Warm browns, cream backgrounds, cozy feeling
- Tech startup? Clean whites, blue accents, modern and sharp
- Kids app? Bright colors, rounded corners, playful elements
- Luxury brand? Dark backgrounds, gold accents, elegant typography
- Each generation should feel custom-made for that specific request

The user will describe what they want. Build exactly what THEY envision, not a generic template.

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
    const { message, chatId, modelId, system, images } = await request.json();

    console.log("[v0-chat] Request received:", {
      preview: message?.slice(0, 80),
      chatId,
      modelId,
      hasImages: Array.isArray(images) && images.length > 0,
      imageCount: Array.isArray(images) ? images.length : 0,
    });

    const hasImages = Array.isArray(images) && images.length > 0;

    if ((!message || typeof message !== "string" || message.trim().length === 0) && !hasImages) {
      return NextResponse.json(
        { error: "Message or image is required" },
        { status: 400 }
      );
    }

    // Determine if using a gateway model or cerebras model
    const isGatewayModel = modelId && GATEWAY_MODELS.some(m => modelId === m || modelId.includes(m));
    const isCerebrasModel = !isGatewayModel && modelId && modelId.startsWith("cerebras/");

    // Validate API keys
    if ((isGatewayModel || hasImages) && !process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        {
          error: "AI_GATEWAY_API_KEY not configured",
          details: "Please add your AI Gateway API key to .env.local",
        },
        { status: 500 }
      );
    }

    if (!isGatewayModel && !hasImages && !process.env.CEREBRAS_API_KEY) {
      console.error("[v0-chat] CEREBRAS_API_KEY not configured");
      return NextResponse.json(
        {
          error: "CEREBRAS_API_KEY not configured",
          details: "Please add your Cerebras API key to .env.local",
        },
        { status: 500 }
      );
    }

    // Process images if present - use vision model to describe them
    let augmentedMessage = message || "Create a web interface inspired by the attached image";
    
    if (hasImages) {
      console.log("[v0-chat] Processing images with vision model...");

      // Select vision model based on selected model tier
      const visionModel = isGatewayModel && modelId?.includes("gemini-3")
        ? VISION_MODEL_AMAZING
        : VISION_MODEL_FAST;

      console.log("[v0-chat] Using vision model:", visionModel);

      try {
        const typedImages = images as ImageData[];

        const descriptions = await Promise.all(
          typedImages.map(async (img, idx) => {
            try {
              const visionResult = await generateText({
                model: gateway(visionModel),
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `${IMAGE_DESCRIPTION_PROMPT}

Label this image clearly. Provide a short title line first (e.g., "Image ${idx + 1} - Solar hero").`,
                      },
                      {
                        type: "image",
                        image: img.mediaType
                          ? `data:${img.mediaType};base64,${img.data}`
                          : img.data,
                      },
                    ],
                  },
                ],
                temperature: 0.25,
                maxOutputTokens: 2000,
              });

              return {
                role: img.role || "inspiration",
                name: img.name || `Image ${idx + 1}`,
                url: img.url,
                description: visionResult?.text || "",
              };
            } catch (err) {
              console.error("[v0-chat] Vision model error on image", idx, err);
              return {
                role: img.role || "inspiration",
                name: img.name || `Image ${idx + 1}`,
                url: img.url,
                description: "",
              };
            }
          })
        );

        const inspirationDescriptions = descriptions
          .filter((d) => d.role === "inspiration")
          .map((d, i) => `Inspiration ${i + 1}${d.url ? ` (URL: ${d.url})` : ""}: ${d.description}`)
          .join("\n\n");

        const assetDescriptions = descriptions
          .filter((d) => d.role === "asset")
          .map((d, i) => `Asset ${i + 1}${d.url ? ` (URL: ${d.url})` : ""}: ${d.description}`)
          .join("\n\n");

        const assetUrlList = typedImages
          .filter((img) => img.role === "asset" && img.url)
          .map((img, i) => `Asset ${i + 1}: ${img.url}`)
          .join("\n");

        const descriptionBlock = [
          inspirationDescriptions && `REFERENCE / INSPIRATION IMAGES:\n${inspirationDescriptions}`,
          assetDescriptions && `IMAGES TO PLACE IN THE SITE:\n${assetDescriptions}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        if (descriptionBlock) {
          augmentedMessage = `The user provided images for this build.

${descriptionBlock}

Asset image URLs (use these directly in the UI where appropriate):
${assetUrlList || "None provided"}

User's additional instructions: ${message || "Create a design based on the references above."}

Requirements:
- Match the style and layout cues from the inspiration images.
- Place the asset images in the generated UI using their URLs (e.g., <img src="..." alt="..."> or as backgrounds).
- Write meaningful alt text derived from the descriptions.
- Ensure the result is a complete, functional UI.`;
        }
      } catch (visionError: any) {
        console.error("[v0-chat] Vision model error:", visionError);
        // Continue with original message if vision fails
        augmentedMessage = `${message || "Create an interface"} (Note: Image processing failed, using text description only)`;
      }
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
        prompt: augmentedMessage,
        temperature: 0.5,
        maxOutputTokens: 40000,
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
        prompt: augmentedMessage,
        temperature: 0.3,
        maxOutputTokens: 40000,
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
