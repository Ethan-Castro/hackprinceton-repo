import { tool as createTool } from 'ai';
import { z } from 'zod';

const GAMMA_API_BASE = 'https://public-api.gamma.app/v1.0';
const GAMMA_API_KEY = process.env.GAMMA_API_KEY;
const allowedCardDimensions = ['fluid', '16x9', '4x3', 'pageless', 'letter', 'a4', '1x1', '4x5', '9x16'] as const;

const cardHeaderFooterItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    value: z.string().min(1),
  }),
  z
    .object({
      type: z.literal('image'),
      source: z.enum(['themeLogo', 'custom']),
      src: z.string().url().optional(),
      size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
    })
    .refine((value) => value.source === 'themeLogo' || Boolean(value.src), {
      message: 'src is required when source is custom',
      path: ['src'],
    }),
  z.object({
    type: z.literal('cardNumber'),
  }),
]);

const cardHeaderFooterSchema = z
  .object({
    topLeft: cardHeaderFooterItemSchema.optional(),
    topCenter: cardHeaderFooterItemSchema.optional(),
    topRight: cardHeaderFooterItemSchema.optional(),
    bottomLeft: cardHeaderFooterItemSchema.optional(),
    bottomCenter: cardHeaderFooterItemSchema.optional(),
    bottomRight: cardHeaderFooterItemSchema.optional(),
    hideFromFirstCard: z.boolean().optional(),
    hideFromLastCard: z.boolean().optional(),
  })
  .refine(
    (value) => Object.values(value).some((entry) => entry !== undefined),
    {
      message: 'Provide at least one header/footer position or visibility flag',
    }
  );

function cleanObject<T extends Record<string, unknown>>(obj: T) {
  return Object.entries(obj).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function deepFindString(
  value: unknown,
  predicate: (str: string) => boolean,
  visited = new Set<unknown>()
): string | undefined {
  if (!value || visited.has(value)) return undefined;
  if (typeof value === 'string') {
    return predicate(value) ? value : undefined;
  }

  if (typeof value === 'object') {
    visited.add(value);
    const entries = Array.isArray(value) ? value : Object.values(value);
    for (const entry of entries) {
      const found = deepFindString(entry, predicate, visited);
      if (found) return found;
    }
  }
  return undefined;
}

function extractViewUrl(result: Record<string, any>) {
  const candidates = [
    result.viewUrl,
    result.viewURL,
    result.view_url,
    result.url,
    result.shareUrl,
    result.shareURL,
    result.publicUrl,
    result.publicURL,
    result.gammaUrl,
    result.gammaURL,
    result?.links?.view,
    result?.links?.viewUrl,
    result?.links?.viewURL,
    result?.links?.public,
    result?.links?.publicUrl,
    result?.links?.publicURL,
    result?.generation?.viewUrl,
    result?.generation?.url,
    result?.generation?.publicUrl,
    result?.data?.viewUrl,
    result?.data?.url,
    result?.data?.publicUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  // Last-resort search: find any URL containing gamma.app
  return deepFindString(result, (str) => /https?:\/\/[^\\s"]*gamma\.app/i.test(str));
}

function extractDownloadUrls(result: Record<string, any>) {
  const primary = result.downloadUrls || result.download_urls || result?.links?.downloadUrls || result?.links?.downloads;
  const pdf =
    primary?.pdf ||
    result.pdfDownloadUrl ||
    result.pdf_download_url ||
    result?.links?.pdf ||
    result?.links?.pdfDownloadUrl ||
    result?.links?.pdf_download_url;
  const pptx =
    primary?.pptx ||
    result.pptxDownloadUrl ||
    result.pptx_download_url ||
    result?.links?.pptx ||
    result?.links?.pptxDownloadUrl ||
    result?.links?.pptx_download_url;
  const defaultUrl =
    result.downloadUrl ||
    result.download_url ||
    primary?.url ||
    primary?.default ||
    result?.links?.download ||
    result?.links?.downloadUrl ||
    result?.links?.download_url ||
    result?.generation?.downloadUrl ||
    result?.data?.downloadUrl;

  const downloads: Record<string, string> = {};
  if (defaultUrl) downloads.default = defaultUrl;
  if (pdf) downloads.pdf = pdf;
  if (pptx) downloads.pptx = pptx;

  if (Object.keys(downloads).length > 0) {
    return downloads;
  }

  // Last-resort search: find any URL ending in .pdf or .pptx
  const foundDownload = deepFindString(
    result,
    (str) => /^https?:\/\/[^\s"]+\.(pdf|pptx)(\?|$)/i.test(str)
  );
  return foundDownload ? { default: foundDownload } : undefined;
}

/**
 * Helper function to make Gamma API requests
 */
async function makeGammaRequest(endpoint: string, method: string, body?: Record<string, unknown>) {
  if (!GAMMA_API_KEY) {
    throw new Error('GAMMA_API_KEY environment variable is not set');
  }

  const cleanBody = body ? JSON.stringify(body) : undefined;
  const url = `${GAMMA_API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': GAMMA_API_KEY,
    },
    body: cleanBody,
  };

  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();
  const parsedJson =
    contentType.includes('application/json') && responseText
      ? (() => {
          try {
            return JSON.parse(responseText);
          } catch {
            return null;
          }
        })()
      : null;

  if (!response.ok) {
    const detail = parsedJson ? JSON.stringify(parsedJson) : responseText || response.statusText;
    throw new Error(`Gamma API error: ${response.status} - ${detail}`);
  }

  if (parsedJson !== null) {
    return parsedJson;
  }

  if (!responseText) {
    return {};
  }

  throw new Error(`Gamma API returned an unexpected response: ${responseText}`);
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
      .max(400000)
      .describe(
        'Text and image URLs to convert into a gamma. Accepts up to ~100k tokens (~400k characters). Insert image URLs where you want them to appear.'
      ),
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
      .enum(allowedCardDimensions)
      .optional()
      .describe('Card aspect ratio. Presentation: fluid/16x9/4x3, Document: fluid/pageless/letter/a4, Social: 1x1/4x5/9x16'),
    cardHeaderFooter: cardHeaderFooterSchema
      .optional()
      .describe(
        'Header/footer configuration for cards. Choose positions (topLeft/topRight/topCenter/bottomLeft/bottomRight/bottomCenter) with type text, image, or cardNumber, plus optional hideFromFirstCard/hideFromLastCard.'
      ),
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
    cardHeaderFooter,
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
      if (cardHeaderFooter) {
        const cleanedHeaderFooter = cleanObject(cardHeaderFooter);
        if (Object.keys(cleanedHeaderFooter).length > 0) {
          cardOptions.headerFooter = cleanedHeaderFooter;
        }
      }
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
 * Tool for creating Gamma content from an existing template
 */
export const createGammaFromTemplate = createTool({
  description:
    'Create a new gamma based on an existing template using Gamma AI. Provide the template gammaId and a prompt that includes text, image URLs, and instructions for how to adapt the template.',
  inputSchema: z.object({
    gammaId: z.string().min(1).describe('The template gammaId to adapt. Copy this from the Gamma app or API.'),
    prompt: z
      .string()
      .min(1)
      .max(400000)
      .describe('Text, image URLs, and instructions for how to adapt the template. Accepts up to ~100k tokens (~400k characters).'),
    themeId: z.string().optional().describe("Theme ID override. Defaults to the template's theme if not provided."),
    folderIds: z
      .array(z.string())
      .optional()
      .describe('Folder IDs to store the generated gamma in. Use listGammaFolders to discover options.'),
    exportAs: z.enum(['pdf', 'pptx']).optional().describe('Return a download link for the specified format once generation completes.'),
    imageModel: z
      .string()
      .optional()
      .describe('AI image model to use if the template uses AI-generated images (e.g., "imagen-4-pro", "flux-1-pro").'),
    imageStyle: z.string().max(500).optional().describe('Image style override if the template uses AI images (e.g., "photorealistic").'),
    workspaceAccess: z
      .enum(['noAccess', 'view', 'comment', 'edit', 'fullAccess'])
      .optional()
      .describe('Workspace access for the generated gamma.'),
    externalAccess: z
      .enum(['noAccess', 'view', 'comment', 'edit'])
      .optional()
      .describe('External access level for the generated gamma.'),
    shareWithEmails: z
      .array(z.string().email({ message: 'Invalid email address' }))
      .optional()
      .describe('Email addresses to share the gamma with once created.'),
    emailAccess: z
      .enum(['view', 'comment', 'edit', 'fullAccess'])
      .optional()
      .describe('Access level for recipients in shareWithEmails. Only workspace members can receive fullAccess.'),
  }),
  execute: async ({
    gammaId,
    prompt,
    themeId,
    folderIds,
    exportAs,
    imageModel,
    imageStyle,
    workspaceAccess,
    externalAccess,
    shareWithEmails,
    emailAccess,
  }) => {
    try {
      if (!gammaId.trim()) throw new Error('Gamma template ID cannot be empty');
      if (!prompt.trim()) throw new Error('Prompt cannot be empty');

      const payload: Record<string, unknown> = {
        gammaId: gammaId.trim(),
        prompt: prompt.trim(),
      };

      if (themeId) payload.themeId = themeId;
      if (folderIds && folderIds.length > 0) payload.folderIds = folderIds;
      if (exportAs) payload.exportAs = exportAs;

      const imageOptions: Record<string, unknown> = {};
      if (imageModel) imageOptions.model = imageModel;
      if (imageStyle) imageOptions.style = imageStyle;
      if (Object.keys(imageOptions).length > 0) payload.imageOptions = imageOptions;

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

      const result = await makeGammaRequest('/generations/from-template', 'POST', payload);

      return {
        generationId: result.generationId,
        templateId: gammaId.trim(),
        status: 'pending',
        message: 'Started Gamma generation from template. Use getGammaGeneration to poll status and fetch the view/download URLs.',
        ...(exportAs && { exportFormat: exportAs }),
      };
    } catch (error) {
      console.error('Error creating Gamma from template:', error);
      throw new Error(
        `Failed to create Gamma from template: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      const viewUrl = extractViewUrl(result);
      const downloadUrls = extractDownloadUrls(result);
      const preferredDownloadUrl = downloadUrls?.default || downloadUrls?.pdf || downloadUrls?.pptx;

      // Build response based on status
      const response: Record<string, unknown> = {
        generationId: result.generationId,
        status: result.status,
        format: result.format,
        ...(viewUrl && { viewUrl }),
        ...(downloadUrls && { downloadUrls }),
        ...(preferredDownloadUrl && { downloadUrl: preferredDownloadUrl }),
      };

      // Add URLs and details when completed
      if (result.status === 'completed') {
        response.title = result.title;
        if (viewUrl && preferredDownloadUrl) {
          response.message = `Generation completed! View at: ${viewUrl}. Download: ${preferredDownloadUrl}`;
        } else if (viewUrl) {
          response.message = `Generation completed! View at: ${viewUrl}`;
        } else if (preferredDownloadUrl) {
          response.message = `Generation completed! Download: ${preferredDownloadUrl}`;
        } else {
          response.message =
            'Generation completed, but no view or download URL was returned. Check Gamma to retrieve the links.';
          response.raw = result;
        }
      } else if (result.status === 'pending' || result.status === 'processing') {
        response.message = 'Generation is still in progress. Check again shortly.';
      } else if (result.status === 'failed') {
        response.message = 'Generation failed. Please try again or check the error details from Gamma.';
        response.error = result.error || result.message;
      } else {
        response.message = 'Generation status returned an unrecognized state.';
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
  createGammaFromTemplate,
  getGammaGeneration,
  listGammaThemes,
  listGammaFolders,
};
