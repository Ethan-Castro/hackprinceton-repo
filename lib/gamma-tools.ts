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
    'Generate a presentation, document, webpage, or social media content using Gamma AI. Converts text and images into beautifully formatted content with customizable themes, styles, and options.',
  inputSchema: z.object({
    inputText: z
      .string()
      .min(1)
      .max(100000)
      .describe('Text and image URLs to convert into a gamma. Can be a few words or pages of text. Insert image URLs where you want them to appear.'),
    format: z
      .enum(['presentation', 'document', 'webpage', 'social'])
      .default('presentation')
      .describe('Type of artifact to create'),
    textMode: z
      .enum(['generate', 'condense', 'preserve'])
      .default('generate')
      .describe('How to modify input text: generate (expand content), condense (summarize), preserve (keep exact text)'),
    themeId: z
      .string()
      .optional()
      .describe('Theme ID to use for styling. Use listGammaThemes to see available options.'),
    numCards: z
      .number()
      .int()
      .min(1)
      .max(75)
      .default(10)
      .describe('Number of cards/slides to create (1-60 for Pro, 1-75 for Ultra)'),
    cardSplit: z
      .enum(['auto', 'inputTextBreaks'])
      .default('auto')
      .describe('How to divide content: auto (AI decides based on numCards), inputTextBreaks (use \\n---\\n breaks in text)'),
    additionalInstructions: z
      .string()
      .max(2000)
      .optional()
      .describe('Extra specifications about desired content, layouts, or styling (1-2000 chars)'),
    folderIds: z
      .array(z.string())
      .optional()
      .describe('Array of folder IDs to store the gamma in. Use listGammaFolders to see available folders.'),
    exportAs: z
      .enum(['pdf', 'pptx'])
      .optional()
      .describe('Export format: pdf or pptx. Returns download link when generation completes.'),
    // Text options
    textAmount: z
      .enum(['brief', 'medium', 'detailed', 'extensive'])
      .optional()
      .describe('Amount of text per card (only applies when textMode is generate or condense)'),
    textTone: z
      .string()
      .max(500)
      .optional()
      .describe('Tone/voice of output (e.g., "professional, inspiring"). Only applies when textMode is generate.'),
    textAudience: z
      .string()
      .max(500)
      .optional()
      .describe('Target audience (e.g., "outdoors enthusiasts"). Only applies when textMode is generate.'),
    textLanguage: z
      .string()
      .optional()
      .describe('Language code (e.g., "en", "es", "fr"). Supports 60+ languages.'),
    // Image options
    imageSource: z
      .enum([
        'aiGenerated',
        'pictographic',
        'unsplash',
        'giphy',
        'webAllImages',
        'webFreeToUse',
        'webFreeToUseCommercially',
        'placeholder',
        'noImages',
      ])
      .optional()
      .describe('Image source. Use noImages if providing your own URLs in inputText. Default: aiGenerated'),
    imageModel: z
      .string()
      .optional()
      .describe('AI image model (e.g., "imagen-4-pro", "flux-1-pro"). Only applies when imageSource is aiGenerated.'),
    imageStyle: z
      .string()
      .max(500)
      .optional()
      .describe('Image style description (e.g., "photorealistic", "minimal, black and white"). Only applies when imageSource is aiGenerated.'),
    // Card options
    cardDimensions: z
      .string()
      .optional()
      .describe('Card aspect ratio. Presentation: fluid/16x9/4x3, Document: fluid/pageless/letter/a4, Social: 1x1/4x5/9x16'),
    // Sharing options
    workspaceAccess: z
      .enum(['noAccess', 'view', 'comment', 'edit', 'fullAccess'])
      .optional()
      .describe('Access level for workspace members. fullAccess allows view, comment, edit, and share.'),
    externalAccess: z
      .enum(['noAccess', 'view', 'comment', 'edit'])
      .optional()
      .describe('Access level for external users (outside workspace).'),
    shareWithEmails: z
      .array(z.string().email({ message: 'Invalid email address' }))
      .optional()
      .describe('Email addresses to share the gamma with.'),
    emailAccess: z
      .enum(['view', 'comment', 'edit', 'fullAccess'])
      .optional()
      .describe('Access level for users specified in shareWithEmails. Requires shareWithEmails to be set.'),
  }),
  execute: async ({
    inputText,
    format,
    textMode,
    themeId,
    numCards,
    cardSplit,
    additionalInstructions,
    folderIds,
    exportAs,
    textAmount,
    textTone,
    textAudience,
    textLanguage,
    imageSource,
    imageModel,
    imageStyle,
    cardDimensions,
    workspaceAccess,
    externalAccess,
    shareWithEmails,
    emailAccess,
  }) => {
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

      // Optional top-level parameters
      if (themeId) payload.themeId = themeId;
      if (additionalInstructions) payload.additionalInstructions = additionalInstructions;
      if (folderIds && folderIds.length > 0) payload.folderIds = folderIds;
      if (exportAs) payload.exportAs = exportAs;

      // Text options
      const textOptions: Record<string, unknown> = {};
      if (textAmount) textOptions.amount = textAmount;
      if (textTone) textOptions.tone = textTone;
      if (textAudience) textOptions.audience = textAudience;
      if (textLanguage) textOptions.language = textLanguage;
      if (Object.keys(textOptions).length > 0) payload.textOptions = textOptions;

      // Image options
      const imageOptions: Record<string, unknown> = {};
      if (imageSource) imageOptions.source = imageSource;
      if (imageModel) imageOptions.model = imageModel;
      if (imageStyle) imageOptions.style = imageStyle;
      if (Object.keys(imageOptions).length > 0) payload.imageOptions = imageOptions;

      // Card options
      const cardOptions: Record<string, unknown> = {};
      if (cardDimensions) cardOptions.dimensions = cardDimensions;
      if (Object.keys(cardOptions).length > 0) payload.cardOptions = cardOptions;

      // Sharing options
      const sharingOptions: Record<string, unknown> = {};
      if (workspaceAccess) sharingOptions.workspaceAccess = workspaceAccess;
      if (externalAccess) sharingOptions.externalAccess = externalAccess;
      if (shareWithEmails && shareWithEmails.length > 0) {
        sharingOptions.emailOptions = {
          recipients: shareWithEmails,
          ...(emailAccess && { access: emailAccess }),
        };
      }
      if (Object.keys(sharingOptions).length > 0) payload.sharingOptions = sharingOptions;

      const result = await makeGammaRequest('/generations', 'POST', payload);

      return {
        generationId: result.generationId,
        format,
        status: 'pending',
        message: `Successfully initiated ${format} generation. Use getGammaGeneration to check status and get the view URL.`,
        ...(exportAs && { exportFormat: exportAs }),
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
    'Get details about a Gamma generation including its status, view URL, and download links. Use this after generating to check if the gamma is ready.',
  inputSchema: z.object({
    generationId: z.string().describe('The ID of the Gamma generation to retrieve'),
  }),
  execute: async ({ generationId }) => {
    try {
      if (!generationId || generationId.trim().length === 0) {
        throw new Error('Generation ID cannot be empty');
      }

      const result = await makeGammaRequest(`/generations/${generationId.trim()}`, 'GET');

      // Build response based on status
      const response: Record<string, unknown> = {
        generationId: result.generationId,
        status: result.status,
        format: result.format,
      };

      // Add URLs and details when completed
      if (result.status === 'completed') {
        response.viewUrl = result.viewUrl;
        response.title = result.title;
        response.message = `Generation completed! View at: ${result.viewUrl}`;

        // Add download URLs if available (from exportAs parameter)
        if (result.downloadUrl) {
          response.downloadUrl = result.downloadUrl;
          response.message = `Generation completed! View at: ${result.viewUrl}. Download: ${result.downloadUrl}`;
        }
      } else if (result.status === 'pending') {
        response.message = 'Generation is still in progress. Check again in a few moments.';
      } else if (result.status === 'failed') {
        response.message = 'Generation failed. Please try again or check the error details.';
        response.error = result.error;
      }

      return response;
    } catch (error) {
      console.error('Error getting Gamma generation:', error);
      throw new Error(`Failed to get generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Tool for listing available Gamma themes
 */
export const listGammaThemes = createTool({
  description:
    'List available Gamma themes for presentations and documents. Supports pagination and search by name. Returns theme IDs, names, types, and style keywords.',
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe('Search themes by name (case-insensitive). E.g., "dark" finds all themes with "dark" in the name.'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Number of themes to return per page (max 50). Default: all themes.'),
    after: z.string().optional().describe('Cursor token for fetching the next page. Use nextCursor from previous response.'),
  }),
  execute: async ({ query, limit, after }) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (limit) params.append('limit', limit.toString());
      if (after) params.append('after', after);

      const endpoint = `/themes${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await makeGammaRequest(endpoint, 'GET');

      // Handle paginated response
      const themes = result.data || [];

      return {
        themes: themes.map((theme: Record<string, unknown>) => ({
          id: theme.id,
          name: theme.name,
          type: theme.type, // 'standard' (global) or 'custom' (workspace-specific)
          colorKeywords: theme.colorKeywords || [],
          toneKeywords: theme.toneKeywords || [],
        })),
        totalReturned: themes.length,
        hasMore: result.hasMore || false,
        nextCursor: result.nextCursor || null,
        message: query
          ? `Found ${themes.length} themes matching "${query}"`
          : `Retrieved ${themes.length} themes${result.hasMore ? ' (more available)' : ''}`,
      };
    } catch (error) {
      console.error('Error listing Gamma themes:', error);
      throw new Error(`Failed to list themes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Tool for listing available Gamma folders
 */
export const listGammaFolders = createTool({
  description:
    'List available Gamma folders in your workspace. Supports pagination and search by name. Folders are used to organize your gammas.',
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe('Search folders by name (case-insensitive). E.g., "design" finds all folders with "design" in the name.'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Number of folders to return per page (max 50). Default: all folders.'),
    after: z.string().optional().describe('Cursor token for fetching the next page. Use nextCursor from previous response.'),
  }),
  execute: async ({ query, limit, after }) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (limit) params.append('limit', limit.toString());
      if (after) params.append('after', after);

      const endpoint = `/folders${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await makeGammaRequest(endpoint, 'GET');

      // Handle paginated response
      const folders = result.data || [];

      return {
        folders: folders.map((folder: Record<string, unknown>) => ({
          id: folder.id,
          name: folder.name,
        })),
        totalReturned: folders.length,
        hasMore: result.hasMore || false,
        nextCursor: result.nextCursor || null,
        message: query
          ? `Found ${folders.length} folders matching "${query}"`
          : `Retrieved ${folders.length} folders${result.hasMore ? ' (more available)' : ''}`,
      };
    } catch (error) {
      console.error('Error listing Gamma folders:', error);
      throw new Error(`Failed to list folders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const gammaTools = {
  generateGamma,
  getGammaGeneration,
  listGammaThemes,
  listGammaFolders,
};
