/**
 * Cerebras UI Generation API
 * Uses GPT-OSS-120B to generate React + Tailwind components
 * Replaces v0.dev API for cost-effective UI generation
 */

import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createCerebras } from "@ai-sdk/cerebras";

const cerebras = createCerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Use GPT-OSS-120B for all UI generation
const UI_GEN_MODEL = "gpt-oss-120b";

// Comprehensive v0-style system prompt for React component generation
const V0_STYLE_SYSTEM_PROMPT = `You are an expert React developer specializing in creating beautiful, functional UI components using React, TypeScript, and Tailwind CSS.

CRITICAL RULES:
1. Generate COMPLETE, WORKING React components that can be rendered immediately
2. Use ONLY these imports:
   - import React from 'react'
   - import { useState, useEffect, useCallback, useMemo } from 'react'
3. Use Tailwind CSS for ALL styling (no custom CSS, no style tags)
4. Make components fully self-contained with all logic included
5. Export as default: export default function ComponentName()
6. Use TypeScript with proper types
7. Include responsive design (mobile-first approach)
8. Add accessibility attributes (aria-labels, roles, semantic HTML)
9. Handle loading and error states gracefully
10. Use semantic HTML elements

REQUIRED STRUCTURE:
\`\`\`tsx
import React, { useState } from 'react';

export default function ComponentName() {
  // State declarations
  const [state, setState] = useState(initialValue);

  // Event handlers
  const handleClick = () => {
    // Logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Component JSX here */}
    </div>
  );
}
\`\`\`

STYLING GUIDELINES:
- Use Tailwind utility classes exclusively (e.g., bg-blue-500, text-white, p-4, rounded-lg)
- Follow modern design principles: clean, minimal, professional
- Use appropriate color schemes with good contrast
- Ensure text is readable (text-gray-900 on light backgrounds, text-white on dark)
- Add hover states for interactive elements (hover:bg-blue-600)
- Include focus rings for accessibility (focus:ring-2 focus:ring-blue-500)
- Use consistent spacing (p-4, gap-4, space-y-4)
- Make designs mobile-responsive (sm:, md:, lg: breakpoints)

COMPONENT QUALITY STANDARDS:
- Production-ready code with no TODOs or placeholders
- Handle edge cases (empty states, loading, errors)
- Include helpful user feedback (success messages, error alerts)
- Optimize performance (useMemo for expensive computations, useCallback for functions)
- Write clean, maintainable, well-organized code
- Add comments for complex logic only
- Use descriptive variable and function names

DATA HANDLING:
- Use realistic sample data for demos
- Handle async operations with loading states
- Show error messages when operations fail
- Validate user inputs before processing
- Display empty states when no data

COMMON PATTERNS:
- Forms: Include labels, validation, submit handlers
- Lists: Map over data with unique keys
- Modals: Include open/close state and backdrop
- Cards: Use consistent padding and shadows
- Buttons: Clear actions with loading states
- Tables: Responsive with proper headers

When the user requests a component, respond with ONLY the complete code block wrapped in \`\`\`tsx...\`\`\`.

IMPORTANT: No explanations, no text before or after the code block. Just output:
\`\`\`tsx
[complete component code here]
\`\`\`

Start your response with \`\`\`tsx and end with \`\`\` - nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, systemPrompt, conversationHistory } = body;

    console.log("[Cerebras UI Gen] Request received");
    console.log("[Cerebras UI Gen] Model:", UI_GEN_MODEL);
    console.log("[Cerebras UI Gen] Message length:", message?.length);
    console.log("[Cerebras UI Gen] Has conversation history:", !!conversationHistory);

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Combine domain-specific prompt (if provided) with base v0-style prompt
    const combinedSystemPrompt = systemPrompt
      ? `${systemPrompt}\n\n${V0_STYLE_SYSTEM_PROMPT}`
      : V0_STYLE_SYSTEM_PROMPT;

    // Build messages array (support conversation history)
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Generate React component using Cerebras GPT-OSS-120B
    console.log("[Cerebras UI Gen] Starting generation with", UI_GEN_MODEL);
    
    const result = streamText({
      model: cerebras(UI_GEN_MODEL),
      system: combinedSystemPrompt,
      messages,
      temperature: 0.7, // Balanced creativity and consistency
      maxOutputTokens: 4096, // Allow for complex components
      onError: (error) => {
        console.error("[Cerebras UI Gen] Streaming Error:", error);
      },
    });

    console.log("[Cerebras UI Gen] Returning stream response");
    
    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("[Cerebras UI Gen] Request error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate UI component",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Allow CORS for development
export const runtime = "edge";
export const maxDuration = 60;
