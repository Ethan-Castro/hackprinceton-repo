import { tool as createTool } from 'ai';
import { z } from 'zod';
import { ArXivClient } from '@deepagent/arxiv';

// Lazy initialization - create client when needed (no API key required)
let arxivClient: ArXivClient | null = null;

function getArXivClient(): ArXivClient {
  if (!arxivClient) {
    arxivClient = new ArXivClient();
  }
  return arxivClient;
}

/**
 * Tool for searching ArXiv research papers
 * Use this to find academic papers related to machine learning, physics, mathematics, etc.
 */
export const searchArXiv = createTool({
  description:
    'Search for research papers on arXiv. Use this to find academic papers on any topic including machine learning, physics, mathematics, computer science, biology, and more. Returns paper titles, authors, abstracts, and links.',
  inputSchema: z.object({
    query: z
      .string()
      .describe('Search query (e.g., "machine learning", "quantum computing", "COVID-19 vaccines")'),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .describe('Maximum number of results to return (default: 10, max: 100)'),
    sortBy: z
      .enum(['relevance', 'lastUpdatedDate', 'submittedDate'])
      .default('relevance')
      .describe('Sort order for results'),
  }),
  execute: async ({ query, maxResults, sortBy }) => {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
      }

      const client = getArXivClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: any = await client.search({
        searchQuery: query.trim(),
        maxResults,
        sortBy,
      });

      // Handle both array and object response formats
      const papers = Array.isArray(results) ? results : (results.entries || []);

      // Format results for better readability
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedResults = papers.map((paper: any) => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors?.join(', ') || 'Unknown',
        publishedDate: paper.published,
        summary: paper.summary?.substring(0, 500) || 'No summary available',
        categories: paper.categories?.join(', ') || 'Unknown',
        url: `https://arxiv.org/abs/${paper.id.split('/').pop()}`,
      }));

      return {
        query,
        totalResults: formattedResults.length,
        papers: formattedResults,
      };
    } catch (error) {
      console.error('Error searching ArXiv:', error);
      throw new Error(`Failed to search ArXiv: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Tool for getting detailed information about a specific ArXiv paper
 */
export const getArXivPaper = createTool({
  description:
    'Get detailed information about a specific ArXiv paper by its ID. Returns full abstract, authors, publication date, and direct link to the paper.',
  inputSchema: z.object({
    paperId: z
      .string()
      .describe('The arXiv paper ID (e.g., "2401.12345" or "1234.56789")'),
  }),
  execute: async ({ paperId }) => {
    try {
      if (!paperId || paperId.trim().length === 0) {
        throw new Error('Paper ID cannot be empty');
      }

      const client = getArXivClient();
      // Search for the specific paper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultsData: any = await client.search({
        searchQuery: `id:${paperId.trim()}`,
        maxResults: 1,
      });

      // Handle both array and object response formats
      const results = Array.isArray(resultsData) ? resultsData : (resultsData.entries || []);

      if (results.length === 0) {
        throw new Error(`Paper with ID ${paperId} not found`);
      }

      const paper = results[0];

      return {
        id: paper.id,
        title: paper.title,
        authors: paper.authors || [],
        publishedDate: paper.published,
        updatedDate: paper.updated,
        summary: paper.summary || 'No summary available',
        categories: paper.categories || [],
        url: `https://arxiv.org/abs/${paper.id.split('/').pop()}`,
        pdfUrl: `https://arxiv.org/pdf/${paper.id.split('/').pop()}.pdf`,
      };
    } catch (error) {
      console.error('Error fetching ArXiv paper:', error);
      throw new Error(`Failed to fetch paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const arxivTools = {
  searchArXiv,
  getArXivPaper,
};
