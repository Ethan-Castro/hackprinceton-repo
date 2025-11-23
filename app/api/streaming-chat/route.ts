import { streamText, convertToModelMessages } from 'ai';
import { resolveModel } from '@/lib/agents/model-factory';
import { tools } from '@/lib/tools';
import { businessTools } from '@/lib/business-tools';
import { SUPPORTED_MODELS } from '@/lib/constants';

/**
 * Streaming Chat API Endpoint
 *
 * Provides real-time text streaming for chat messages
 * Supports different chat modes:
 * - general: Standard chat with base tools
 * - business: Business analyst mode with business tools
 * - analysis: Structured analysis mode
 */

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const {
      message,
      modelId = 'claude-3-5-sonnet-20241022',
      chatMode = 'general',
    }: {
      message: string;
      modelId: string;
      chatMode: 'general' | 'business' | 'analysis';
    } = await req.json();

    if (!SUPPORTED_MODELS.includes(modelId)) {
      return new Response('Invalid model', { status: 400 });
    }

    const { model } = resolveModel(modelId);

    // Select tools based on chat mode
    let modeTools: any = tools;
    if (chatMode === 'business' || chatMode === 'analysis') {
      modeTools = { ...tools, ...businessTools };
    }

    // Select system prompt based on mode
    let systemPrompt = `You are an expert AI assistant. Provide clear, accurate, and helpful responses using markdown formatting.`;
    if (chatMode === 'business' || chatMode === 'analysis') {
      systemPrompt = `You are an expert business analyst with access to advanced analysis tools. Provide data-driven insights, market research, financial analysis, and strategic recommendations. Use available tools to generate comprehensive business analyses.`;
    }

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: message,
      tools: modeTools as any,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('[Streaming Chat] Error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
