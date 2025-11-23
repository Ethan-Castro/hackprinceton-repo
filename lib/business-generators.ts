import { generateObject } from 'ai';
import type { LanguageModel } from 'ai';
import { z } from 'zod';

/**
 * Business data generators using generateObject()
 * These functions use structured data generation for guaranteed schema compliance
 * and improved efficiency over traditional tool-based approaches
 */

// ============================================================================
// Schemas (shared with business-tools.ts for consistency)
// ============================================================================

const BusinessPlanSchema = z.object({
  companyName: z.string().describe('Name of the business'),
  executiveSummary: z.string().describe('High-level overview of the business opportunity'),
  sections: z.array(
    z.object({
      title: z.string().describe('Section title (e.g., "Market Analysis", "Marketing Strategy")'),
      content: z.string().describe('Detailed section content in markdown format'),
      subsections: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ).optional().describe('Optional subsections'),
    })
  ).describe('Main sections of the business plan'),
  financialHighlights: z.object({
    projectedRevenue: z.string().optional(),
    fundingRequested: z.string().optional(),
    breakEvenTimeline: z.string().optional(),
  }).optional().describe('Key financial metrics'),
});

const FinancialProjectionsSchema = z.object({
  title: z.string().describe('Title for the financial projections'),
  timeframe: z.string().describe('Projection period (e.g., "3 Years", "5 Years")'),
  revenueStreams: z.array(
    z.object({
      name: z.string().describe('Revenue stream name'),
      projections: z.array(
        z.object({
          period: z.string().describe('Time period (e.g., "Year 1", "Q1 2025")'),
          amount: z.number().describe('Projected revenue amount'),
        })
      ),
    })
  ).describe('Different revenue sources'),
  expenses: z.array(
    z.object({
      category: z.string().describe('Expense category'),
      projections: z.array(
        z.object({
          period: z.string(),
          amount: z.number(),
        })
      ),
    })
  ).describe('Expense categories and projections'),
  assumptions: z.array(z.string()).describe('Key assumptions underlying the projections'),
  metrics: z.object({
    grossMargin: z.number().optional().describe('Gross margin percentage'),
    netMargin: z.number().optional().describe('Net margin percentage'),
    burnRate: z.number().optional().describe('Monthly burn rate'),
    runway: z.string().optional().describe('Cash runway'),
  }).optional(),
});

const MarketAnalysisSchema = z.object({
  industry: z.string().describe('Industry or market sector'),
  marketSize: z.object({
    tam: z.string().optional().describe('Total Addressable Market'),
    sam: z.string().optional().describe('Serviceable Available Market'),
    som: z.string().optional().describe('Serviceable Obtainable Market'),
  }).optional().describe('Market sizing'),
  trends: z.array(
    z.object({
      trend: z.string().describe('Market trend description'),
      impact: z.enum(['high', 'medium', 'low']).describe('Impact level'),
    })
  ).describe('Current market trends'),
  customerSegments: z.array(
    z.object({
      segment: z.string().describe('Customer segment name'),
      size: z.string().optional().describe('Segment size estimation'),
      characteristics: z.array(z.string()).describe('Segment characteristics'),
    })
  ).describe('Target customer segments'),
  competitiveLandscape: z.array(
    z.object({
      competitor: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })
  ).optional().describe('Key competitors and positioning'),
  opportunities: z.array(z.string()).optional().describe('Market opportunities'),
});

const CompetitorAnalysisSchema = z.object({
  title: z.string().describe('Analysis title'),
  competitors: z.array(
    z.object({
      name: z.string().describe('Competitor name'),
      strengths: z.array(z.string()).describe('Competitive strengths'),
      weaknesses: z.array(z.string()).describe('Competitive weaknesses'),
      marketPosition: z.string().optional().describe('Market positioning'),
    })
  ).describe('Competitor details'),
  comparisonMatrix: z.record(
    z.string(),
    z.object({
      ourScore: z.number().min(1).max(5),
      competitorScores: z.record(z.string(), z.number().min(1).max(5)),
    })
  ).optional().describe('Feature comparison matrix'),
  positioningStrategy: z.string().optional().describe('Recommended positioning strategy'),
  recommendations: z.array(z.string()).optional().describe('Strategic recommendations'),
});

// ============================================================================
// Generator Functions
// ============================================================================

/**
 * Generate a comprehensive business plan using structured data generation
 */
export async function generateBusinessPlanStructured(
  model: LanguageModel,
  context: {
    companyName: string;
    businessDescription: string;
    targetMarket?: string;
  }
) {
  return await generateObject({
    model,
    schema: BusinessPlanSchema,
    system: `You are an expert business plan writer. Generate a comprehensive, professional business plan with detailed sections, subsections, and financial highlights. Ensure the plan is thorough and actionable.`,
    prompt: `Create a detailed business plan for "${context.companyName}". ${
      context.businessDescription ? `Business description: ${context.businessDescription}. ` : ''
    }${
      context.targetMarket ? `Target market: ${context.targetMarket}.` : ''
    } Include an executive summary, market analysis, marketing strategy, organization structure, financial projections, and funding requirements.`,
  });
}

/**
 * Generate financial projections using structured data generation
 */
export async function generateFinancialProjectionsStructured(
  model: LanguageModel,
  context: {
    businessType: string;
    timeframe: '3 Years' | '5 Years' | '10 Years';
    startingCapital?: number;
    targetRevenue?: number;
  }
) {
  return await generateObject({
    model,
    schema: FinancialProjectionsSchema,
    system: `You are a financial analyst expert. Generate realistic, detailed financial projections with multiple revenue streams, expense categories, and key financial metrics. Base projections on industry standards and realistic growth assumptions.`,
    prompt: `Generate ${context.timeframe} of detailed financial projections for a ${context.businessType}.${
      context.startingCapital ? ` Starting capital: $${context.startingCapital}. ` : ' '
    }${
      context.targetRevenue ? `Target revenue by year end: $${context.targetRevenue}. ` : ''
    }Include revenue streams, expense categories, financial metrics, and key assumptions.`,
  });
}

/**
 * Generate market analysis using structured data generation
 */
export async function generateMarketAnalysisStructured(
  model: LanguageModel,
  context: {
    industry: string;
    productOrService: string;
    targetGeography?: string;
  }
) {
  return await generateObject({
    model,
    schema: MarketAnalysisSchema,
    system: `You are a market research analyst. Generate comprehensive market analysis with TAM/SAM/SOM sizing, industry trends, customer segments, and competitive landscape. Use realistic estimates based on industry data.`,
    prompt: `Analyze the market for ${context.productOrService} in the ${context.industry} industry.${
      context.targetGeography ? ` Focus on ${context.targetGeography}.` : ''
    } Include market sizing (TAM/SAM/SOM), current trends, customer segments, competitive landscape, and market opportunities.`,
  });
}

/**
 * Generate competitor analysis using structured data generation
 */
export async function generateCompetitorAnalysisStructured(
  model: LanguageModel,
  context: {
    company: string;
    industry: string;
    mainCompetitors?: string[];
  }
) {
  const competitorsList = context.mainCompetitors?.join(', ') || 'major competitors in the space';

  return await generateObject({
    model,
    schema: CompetitorAnalysisSchema,
    system: `You are a competitive intelligence analyst. Generate detailed competitor analysis with strengths, weaknesses, and market positioning. Create comparison matrices for key business factors.`,
    prompt: `Analyze the competitive landscape for ${context.company} in the ${context.industry} industry. Compare against ${competitorsList}. Include strengths, weaknesses, positioning strategies, and recommendations for differentiation.`,
  });
}

// ============================================================================
// Helper: Generate multiple business analyses in parallel
// ============================================================================

export interface BusinessAnalysisRequest {
  businessPlan?: {
    companyName: string;
    businessDescription: string;
    targetMarket?: string;
  };
  financialProjections?: {
    businessType: string;
    timeframe: '3 Years' | '5 Years' | '10 Years';
    startingCapital?: number;
    targetRevenue?: number;
  };
  marketAnalysis?: {
    industry: string;
    productOrService: string;
    targetGeography?: string;
  };
  competitorAnalysis?: {
    company: string;
    industry: string;
    mainCompetitors?: string[];
  };
}

export async function generateBusinessAnalyses(
  model: LanguageModel,
  requests: BusinessAnalysisRequest
) {
  const results: Record<string, any> = {};

  // Create promises for each requested analysis
  const promises: Promise<any>[] = [];
  const keys: string[] = [];

  if (requests.businessPlan) {
    keys.push('businessPlan');
    promises.push(generateBusinessPlanStructured(model, requests.businessPlan));
  }

  if (requests.financialProjections) {
    keys.push('financialProjections');
    promises.push(generateFinancialProjectionsStructured(model, requests.financialProjections));
  }

  if (requests.marketAnalysis) {
    keys.push('marketAnalysis');
    promises.push(generateMarketAnalysisStructured(model, requests.marketAnalysis));
  }

  if (requests.competitorAnalysis) {
    keys.push('competitorAnalysis');
    promises.push(generateCompetitorAnalysisStructured(model, requests.competitorAnalysis));
  }

  // Execute all analyses in parallel
  const responses = await Promise.all(promises);

  // Map results
  responses.forEach((response, index) => {
    results[keys[index]] = response.object;
  });

  return results;
}
