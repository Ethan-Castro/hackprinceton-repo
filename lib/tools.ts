import { tool as createTool } from 'ai';
import { z } from 'zod';
import { textbookTools } from './textbook-tools';
import { businessTools } from './business-tools';

/**
 * Tool for displaying content in an artifact container
 * Use this when you want to show code, documents, or structured content
 * with actions like copy, download, or close
 */
export const displayArtifact = createTool({
  description:
    'Display content in a structured artifact container with optional title, description, and action buttons. Use this for showing code snippets, documents, or any structured output that benefits from a clean, bordered presentation with header actions.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('The title to display in the artifact header')
      .optional(),
    description: z
      .string()
      .describe('A brief description to show below the title')
      .optional(),
    content: z
      .string()
      .describe('The main content to display in the artifact body'),
    contentType: z
      .enum(['code', 'text', 'markdown', 'html'])
      .describe('The type of content being displayed')
      .default('text'),
    language: z
      .string()
      .describe('Programming language for syntax highlighting (if contentType is code)')
      .optional(),
  }),
  execute: async function ({ title, description, content, contentType, language }) {
    try {
      // Validate content is not empty
      if (!content || content.trim().length === 0) {
        throw new Error("Content cannot be empty");
      }

      // This is executed on the server, just return the data
      // The actual rendering happens on the client
      return {
        title,
        description,
        content,
        contentType,
        language,
      };
    } catch (error) {
      console.error("Error in displayArtifact:", error);
      throw error;
    }
  },
});

/**
 * Tool for previewing web content or generated UI
 * Use this when you want to display a live preview of a webpage or UI component
 */
export const displayWebPreview = createTool({
  description:
    'Display a web preview with an interactive iframe. Use this to show live previews of webpages, generated HTML/UI components, or any URL-based content. Supports navigation controls and multiple display modes.',
  inputSchema: z.object({
    url: z
      .string()
      .url()
      .describe('The URL to display in the preview iframe'),
    title: z
      .string()
      .describe('Optional title for the preview')
      .optional(),
    description: z
      .string()
      .describe('Optional description of what is being previewed')
      .optional(),
  }),
  execute: async function ({ url, title, description }) {
    try {
      // Validate URL format
      const urlObj = new URL(url);

      // Basic security check: only allow http/https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are allowed");
      }

      return {
        url,
        title,
        description,
      };
    } catch (error) {
      console.error("Error in displayWebPreview:", error);
      throw error;
    }
  },
});

/**
 * Tool for generating and displaying HTML previews
 * Use this when you generate HTML/CSS/JS code that should be previewed live
 */
export const generateHtmlPreview = createTool({
  description:
    'Generate and display a live HTML preview. Use this when creating HTML/CSS/JavaScript code that should be rendered and previewed immediately. The generated code will be displayed in an interactive iframe.',
  inputSchema: z.object({
    html: z
      .string()
      .describe('The complete HTML content to preview, including any inline CSS and JavaScript'),
    title: z
      .string()
      .describe('Title describing what was generated')
      .optional(),
    description: z
      .string()
      .describe('Brief description of the generated content')
      .optional(),
  }),
  execute: async function ({ html, title, description }) {
    try {
      // Validate HTML is not empty
      if (!html || html.trim().length === 0) {
        throw new Error("HTML content cannot be empty");
      }

      // Return the HTML as a data URL for the iframe
      const encodedHtml = encodeURIComponent(html);
      const dataUrl = `data:text/html;charset=utf-8,${encodedHtml}`;

      return {
        html,
        dataUrl,
        title,
        description,
      };
    } catch (error) {
      console.error("Error in generateHtmlPreview:", error);
      throw error;
    }
  },
});

export const tools = {
  displayArtifact,
  displayWebPreview,
  generateHtmlPreview,
  ...textbookTools,
  ...businessTools,
};


