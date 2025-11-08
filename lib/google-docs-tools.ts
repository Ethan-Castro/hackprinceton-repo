import { tool as createTool } from 'ai';
import { z } from 'zod';
import { GoogleDocsClient } from '@deepagent/google-docs';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

/**
 * Helper function to get authenticated Google Docs client
 * This requires GOOGLE_CREDENTIALS_PATH environment variable to be set
 */
async function getAuthenticatedDocsClient() {
  try {
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;

    if (!credentialsPath) {
      throw new Error(
        'GOOGLE_CREDENTIALS_PATH environment variable is not set. ' +
          'Please set it to the path of your Google service account credentials JSON file.'
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auth: any = await authenticate({
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
      keyfilePath: credentialsPath,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = google.docs({ version: 'v1', auth } as any);
    return new GoogleDocsClient({ docs });
  } catch (error) {
    throw new Error(
      `Failed to authenticate with Google Docs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Tool for reading Google Docs
 * Use this to fetch and read the content of a Google Document
 */
export const readGoogleDoc = createTool({
  description:
    'Read the content of a Google Document. Requires authentication via Google service account credentials. Use this to fetch document text, headings, and structure from a shared Google Doc. Returns the full text content of the document.',
  inputSchema: z.object({
    documentId: z
      .string()
      .describe(
        'The Google Docs document ID (found in the URL: docs.google.com/document/d/[DOCUMENT_ID]/edit)'
      ),
  }),
  execute: async ({ documentId }) => {
    try {
      if (!documentId || documentId.trim().length === 0) {
        throw new Error('Document ID cannot be empty');
      }

      const docsClient = await getAuthenticatedDocsClient();
      const document = await docsClient.getDocument({
        documentId: documentId.trim(),
      });

      if (!document) {
        throw new Error(`Document with ID ${documentId} not found or inaccessible`);
      }

      // Extract text from the document
      let fullText = '';
      if (document.body?.content) {
        for (const element of document.body.content) {
          if (element.paragraph?.elements) {
            for (const textElement of element.paragraph.elements) {
              if (textElement.textRun?.content) {
                fullText += textElement.textRun.content;
              }
            }
          }
        }
      }

      return {
        documentId,
        title: document.title || 'Untitled',
        url: `https://docs.google.com/document/d/${documentId}/edit`,
        content: fullText.trim() || 'Document appears to be empty',
        characterCount: fullText.length,
      };
    } catch (error) {
      console.error('Error reading Google Doc:', error);
      throw new Error(
        `Failed to read Google Doc: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});

/**
 * Tool for getting document metadata
 * Use this to get information about a Google Document without reading the full content
 */
export const getGoogleDocMetadata = createTool({
  description:
    'Get metadata about a Google Document (title, last modified, etc.) without reading the full content. Useful for checking if you have access to a document or getting document information.',
  inputSchema: z.object({
    documentId: z
      .string()
      .describe('The Google Docs document ID (found in the URL: docs.google.com/document/d/[DOCUMENT_ID]/edit)'),
  }),
  execute: async ({ documentId }) => {
    try {
      if (!documentId || documentId.trim().length === 0) {
        throw new Error('Document ID cannot be empty');
      }

      const docsClient = await getAuthenticatedDocsClient();
      const document = await docsClient.getDocument({
        documentId: documentId.trim(),
      });

      if (!document) {
        throw new Error(`Document with ID ${documentId} not found or inaccessible`);
      }

      // Count elements for stats
      let paragraphCount = 0;
      let totalCharacters = 0;

      if (document.body?.content) {
        for (const element of document.body.content) {
          if (element.paragraph) {
            paragraphCount++;
            if (element.paragraph.elements) {
              for (const textElement of element.paragraph.elements) {
                if (textElement.textRun?.content) {
                  totalCharacters += textElement.textRun.content.length;
                }
              }
            }
          }
        }
      }

      return {
        documentId,
        title: document.title || 'Untitled',
        url: `https://docs.google.com/document/d/${documentId}/edit`,
        revisionId: document.revisionId,
        paragraphCount,
        totalCharacters,
        lastModified: document.body?.content?.[document.body.content.length - 1]?.paragraph ? 'Unknown' : 'Unknown',
      };
    } catch (error) {
      console.error('Error getting Google Doc metadata:', error);
      throw new Error(
        `Failed to get document metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});

export const googleDocsTools = {
  readGoogleDoc,
  getGoogleDocMetadata,
};
