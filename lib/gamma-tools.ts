import { tool as createTool } from 'ai';
import { z } from 'zod';

const GAMMA_API_BASE = 'https://public-api.gamma.app/v1.0';
const GAMMA_API_KEY = process.env.GAMMA_API_KEY;

/**
 * Helper function to make Gamma API requests
 */
async function makeGammaRequest(endpoint: string, method: string, body?: Record<string, unknown>) {
  if (!GAMMA_API_KEY) {
    throw new Error('GAMMA_API_KEY environment variable is not set');
  }

  const url = `${GAMMA_API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': GAMMA_API_KEY,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gamma API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Tool for generating presentations, documents, or webpages with Gamma
 */
export const generateGamma = createTool({
  description:
    'Generate a presentation, document, or webpage using Gamma AI. Converts text and images into beautifully formatted content. Supports creating presentations, documents, webpages, and social media content.',
  inputSchema: z.object({
    inputText: z
      .string()
      .min(1)
      .max(100000)
      .describe('Text and image URLs to convert into a gamma. Can be a few words or pages of text.'),
    format: z
      .enum(['presentation', 'document', 'webpage', 'social'])
      .default('presentation')
      .describe('Type of artifact to create (presentation, document, webpage, or social)'),
    textMode: z
      .enum(['generate', 'condense', 'preserve'])
      .default('generate')
      .describe('How to modify the input text (generate: create new content, condense: shorten, preserve: keep as-is)'),
    numCards: z
      .number()
      .int()
      .min(1)
      .max(75)
      .default(10)
      .describe('Number of cards/slides to create (1-75)'),
    cardSplit: z
      .enum(['auto', 'inputTextBreaks'])
      .default('auto')
      .describe('How to divide content (auto: let AI decide, inputTextBreaks: use line breaks)'),
    additionalInstructions: z
      .string()
      .max(2000)
      .optional()
      .describe('Extra specifications about desired content and layouts (e.g., "Make the titles catchy")'),
  }),
  execute: async ({ inputText, format, textMode, numCards, cardSplit, additionalInstructions }) => {
    try {
      if (!inputText || inputText.trim().length === 0) {
        throw new Error('Input text cannot be empty');
      }

      const payload: Record<string, unknown> = {
        inputText: inputText.trim(),
        format,
        textMode,
        numCards,
        cardSplit,
      };

      if (additionalInstructions) {
        payload.additionalInstructions = additionalInstructions;
      }

      const result = await makeGammaRequest('/generations', 'POST', payload);

      return {
        generationId: result.generationId,
        format,
        status: 'created',
        message: `Successfully created ${format}. Generation ID: ${result.generationId}`,
        viewUrl: `https://gamma.app/view/${result.generationId}`,
      };
    } catch (error) {
      console.error('Error generating Gamma:', error);
      throw new Error(`Failed to generate Gamma: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Tool for checking Gamma generation status and getting URLs
 */
export const getGammaGeneration = createTool({
  description:
    'Get details about a Gamma generation including its status, view URL, and available export formats (PDF, PPTX).',
  inputSchema: z.object({
    generationId: z.string().describe('The ID of the Gamma generation to retrieve'),
  }),
  execute: async ({ generationId }) => {
    try {
      if (!generationId || generationId.trim().length === 0) {
        throw new Error('Generation ID cannot be empty');
      }

      const result = await makeGammaRequest(`/generations/${generationId.trim()}`, 'GET');

      return {
        generationId: result.generationId,
        status: result.status || 'completed',
        format: result.format,
        viewUrl: `https://gamma.app/view/${result.generationId}`,
        downloadUrl: result.downloadUrl,
        title: result.title,
        message: `Generation ready. View at: https://gamma.app/view/${result.generationId}`,
      };
    } catch (error) {
      console.error('Error getting Gamma generation:', error);
      throw new Error(`Failed to get generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Tool for exporting Gamma to PDF or PPTX
 */
export const exportGamma = createTool({
  description:
    'Export a Gamma generation to PDF or PPTX format. Get a download link for the exported file.',
  inputSchema: z.object({
    generationId: z.string().describe('The ID of the Gamma generation to export'),
    exportFormat: z.enum(['pdf', 'pptx']).describe('File format to export (pdf or pptx)'),
  }),
  execute: async ({ generationId, exportFormat }) => {
    try {
      if (!generationId || generationId.trim().length === 0) {
        throw new Error('Generation ID cannot be empty');
      }

      const payload = {
        exportAs: exportFormat,
      };

      const result = await makeGammaRequest(
        `/generations/${generationId.trim()}/export`,
        'POST',
        payload as Record<string, unknown>
      );

      return {
        generationId,
        exportFormat,
        downloadUrl: result.downloadUrl,
        status: 'ready',
        message: `Export to ${exportFormat.toUpperCase()} ready for download`,
        expiresIn: '24 hours',
      };
    } catch (error) {
      console.error('Error exporting Gamma:', error);
      throw new Error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Tool for listing available Gamma themes
 */
export const listGammaThemes = createTool({
  description: 'List all available Gamma themes that can be used for presentations and documents.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const result = await makeGammaRequest('/themes', 'GET');

      const themes = result.themes || result.data || [];

      return {
        totalThemes: Array.isArray(themes) ? themes.length : 0,
        themes: Array.isArray(themes)
          ? themes.slice(0, 20).map((theme: Record<string, unknown>) => ({
              id: theme.id,
              name: theme.name,
              description: theme.description,
            }))
          : [],
        message: `Found ${Array.isArray(themes) ? themes.length : 0} available themes`,
      };
    } catch (error) {
      console.error('Error listing Gamma themes:', error);
      throw new Error(`Failed to list themes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const gammaTools = {
  generateGamma,
  getGammaGeneration,
  exportGamma,
  listGammaThemes,
};
