import { tool as createTool } from 'ai';
import { z } from 'zod';

/**
 * Tool for generating a comprehensive business plan
 * Creates structured business plan with executive summary, market analysis, financial projections, etc.
 */
export const generateBusinessPlan = createTool({
  description:
    'Generate a comprehensive business plan with executive summary, company description, market analysis, organization structure, product/service line, marketing strategy, financial projections, and funding requirements. Use this for creating detailed business planning documents.',
  inputSchema: z.object({
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
  }),
  execute: async function ({ companyName, executiveSummary, sections, financialHighlights }) {
    try {
      if (!companyName || !executiveSummary || !sections || sections.length === 0) {
        throw new Error('Business plan must have company name, executive summary, and sections');
      }

      return {
        companyName,
        executiveSummary,
        sections,
        financialHighlights,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in generateBusinessPlan:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating financial projections
 * Creates revenue, expense, and cash flow projections
 */
export const generateFinancialProjections = createTool({
  description:
    'Generate detailed financial projections including revenue forecasts, expense breakdowns, cash flow statements, and profit/loss projections. Use this for creating financial models and forecasts.',
  inputSchema: z.object({
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
  }),
  execute: async function ({ title, timeframe, revenueStreams, expenses, assumptions, metrics }) {
    try {
      if (!revenueStreams || revenueStreams.length === 0) {
        throw new Error('Must provide at least one revenue stream');
      }

      return {
        title,
        timeframe,
        revenueStreams,
        expenses,
        assumptions,
        metrics,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in generateFinancialProjections:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating SWOT analysis
 * Creates strengths, weaknesses, opportunities, and threats matrix
 */
export const generateSWOTAnalysis = createTool({
  description:
    'Generate a SWOT analysis matrix showing Strengths, Weaknesses, Opportunities, and Threats. Use this for strategic planning and competitive analysis.',
  inputSchema: z.object({
    title: z.string().describe('Title for the SWOT analysis'),
    context: z.string().describe('Business context or focus area for the analysis'),
    strengths: z.array(
      z.object({
        title: z.string().describe('Strength title'),
        description: z.string().describe('Detailed description'),
      })
    ).describe('Internal positive attributes'),
    weaknesses: z.array(
      z.object({
        title: z.string().describe('Weakness title'),
        description: z.string().describe('Detailed description'),
      })
    ).describe('Internal areas for improvement'),
    opportunities: z.array(
      z.object({
        title: z.string().describe('Opportunity title'),
        description: z.string().describe('Detailed description'),
      })
    ).describe('External favorable conditions'),
    threats: z.array(
      z.object({
        title: z.string().describe('Threat title'),
        description: z.string().describe('Detailed description'),
      })
    ).describe('External challenges or risks'),
    recommendations: z.array(z.string()).optional().describe('Strategic recommendations based on SWOT'),
  }),
  execute: async function ({ title, context, strengths, weaknesses, opportunities, threats, recommendations }) {
    try {
      return {
        title,
        context,
        strengths,
        weaknesses,
        opportunities,
        threats,
        recommendations,
      };
    } catch (error) {
      console.error('Error in generateSWOTAnalysis:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating Business Model Canvas
 * Creates the 9-block business model canvas
 */
export const generateBusinessModelCanvas = createTool({
  description:
    'Generate a Business Model Canvas with all 9 building blocks: Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure, and Revenue Streams. Use this for visualizing business model architecture.',
  inputSchema: z.object({
    businessName: z.string().describe('Name of the business'),
    valuePropositions: z.array(z.string()).describe('Value propositions offered to customers'),
    customerSegments: z.array(z.string()).describe('Target customer groups'),
    channels: z.array(z.string()).describe('How value is delivered to customers'),
    customerRelationships: z.array(z.string()).describe('Types of relationships with customers'),
    revenueStreams: z.array(z.string()).describe('How the business generates revenue'),
    keyResources: z.array(z.string()).describe('Critical assets required'),
    keyActivities: z.array(z.string()).describe('Most important activities'),
    keyPartners: z.array(z.string()).describe('Network of suppliers and partners'),
    costStructure: z.array(z.string()).describe('Main costs and expenses'),
  }),
  execute: async function ({
    businessName,
    valuePropositions,
    customerSegments,
    channels,
    customerRelationships,
    revenueStreams,
    keyResources,
    keyActivities,
    keyPartners,
    costStructure,
  }) {
    try {
      return {
        businessName,
        valuePropositions,
        customerSegments,
        channels,
        customerRelationships,
        revenueStreams,
        keyResources,
        keyActivities,
        keyPartners,
        costStructure,
      };
    } catch (error) {
      console.error('Error in generateBusinessModelCanvas:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating market analysis
 * Creates comprehensive market research and analysis
 */
export const generateMarketAnalysis = createTool({
  description:
    'Generate comprehensive market analysis including market size (TAM/SAM/SOM), trends, customer segments, competitive landscape, and market entry strategy. Use this for market research and opportunity assessment.',
  inputSchema: z.object({
    title: z.string().describe('Title of the market analysis'),
    industry: z.string().describe('Industry or market being analyzed'),
    marketSize: z.object({
      tam: z.object({
        value: z.string().describe('Total Addressable Market size'),
        description: z.string(),
      }).optional(),
      sam: z.object({
        value: z.string().describe('Serviceable Addressable Market size'),
        description: z.string(),
      }).optional(),
      som: z.object({
        value: z.string().describe('Serviceable Obtainable Market size'),
        description: z.string(),
      }).optional(),
    }).describe('Market size breakdown'),
    trends: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        impact: z.enum(['high', 'medium', 'low']).optional(),
      })
    ).describe('Key market trends'),
    customerSegments: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        size: z.string().optional(),
        characteristics: z.array(z.string()).optional(),
      })
    ).describe('Target customer segments'),
    competitiveLandscape: z.string().describe('Overview of competitive dynamics'),
    barriers: z.array(z.string()).optional().describe('Market entry barriers'),
    opportunities: z.array(z.string()).optional().describe('Market opportunities'),
  }),
  execute: async function ({
    title,
    industry,
    marketSize,
    trends,
    customerSegments,
    competitiveLandscape,
    barriers,
    opportunities,
  }) {
    try {
      return {
        title,
        industry,
        marketSize,
        trends,
        customerSegments,
        competitiveLandscape,
        barriers,
        opportunities,
      };
    } catch (error) {
      console.error('Error in generateMarketAnalysis:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating pitch deck
 * Creates presentation slides for investor pitches
 */
export const generatePitchDeck = createTool({
  description:
    'Generate a pitch deck with slides covering problem, solution, market opportunity, business model, traction, team, competition, and ask. Use this for creating investor presentations.',
  inputSchema: z.object({
    companyName: z.string().describe('Company name'),
    tagline: z.string().describe('One-line company description'),
    slides: z.array(
      z.object({
        title: z.string().describe('Slide title'),
        type: z.enum([
          'cover',
          'problem',
          'solution',
          'market',
          'product',
          'business-model',
          'traction',
          'competition',
          'team',
          'financials',
          'ask',
          'custom'
        ]).describe('Type of slide'),
        content: z.string().describe('Main content in markdown format'),
        bullets: z.array(z.string()).optional().describe('Key bullet points'),
        metrics: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        ).optional().describe('Key metrics for this slide'),
      })
    ).describe('Array of presentation slides'),
  }),
  execute: async function ({ companyName, tagline, slides }) {
    try {
      if (!slides || slides.length === 0) {
        throw new Error('Pitch deck must have at least one slide');
      }

      return {
        companyName,
        tagline,
        slides,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in generatePitchDeck:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating financial dashboard
 * Creates interactive dashboard with KPIs and metrics
 */
export const generateFinancialDashboard = createTool({
  description:
    'Generate an interactive financial dashboard with key performance indicators, charts, and metrics. Use this for visualizing business performance and financial health.',
  inputSchema: z.object({
    title: z.string().describe('Dashboard title'),
    period: z.string().describe('Time period covered (e.g., "Q4 2024", "FY 2024")'),
    kpis: z.array(
      z.object({
        name: z.string().describe('KPI name'),
        value: z.string().describe('Current value'),
        change: z.string().optional().describe('Change from previous period (e.g., "+15%")'),
        trend: z.enum(['up', 'down', 'flat']).optional(),
      })
    ).describe('Key performance indicators'),
    charts: z.array(
      z.object({
        title: z.string().describe('Chart title'),
        type: z.enum(['line', 'bar', 'pie', 'area']).describe('Chart type'),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          })
        ).describe('Chart data points'),
        description: z.string().optional(),
      })
    ).describe('Data visualizations'),
    insights: z.array(z.string()).optional().describe('Key insights and observations'),
  }),
  execute: async function ({ title, period, kpis, charts, insights }) {
    try {
      if (!kpis || kpis.length === 0) {
        throw new Error('Dashboard must have at least one KPI');
      }

      return {
        title,
        period,
        kpis,
        charts,
        insights,
      };
    } catch (error) {
      console.error('Error in generateFinancialDashboard:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating marketing plan
 * Creates go-to-market strategy and marketing campaigns
 */
export const generateMarketingPlan = createTool({
  description:
    'Generate a comprehensive marketing plan including positioning, target audience, channels, campaigns, budget, and metrics. Use this for planning marketing strategy and execution.',
  inputSchema: z.object({
    title: z.string().describe('Marketing plan title'),
    positioning: z.string().describe('Market positioning and unique value proposition'),
    targetAudience: z.array(
      z.object({
        segment: z.string().describe('Audience segment name'),
        description: z.string().describe('Detailed audience description'),
        size: z.string().optional(),
      })
    ).describe('Target audience segments'),
    channels: z.array(
      z.object({
        name: z.string().describe('Marketing channel (e.g., "Social Media", "Content Marketing")'),
        strategy: z.string().describe('Channel strategy'),
        budget: z.string().optional(),
        expectedROI: z.string().optional(),
      })
    ).describe('Marketing channels and strategies'),
    campaigns: z.array(
      z.object({
        name: z.string().describe('Campaign name'),
        objective: z.string().describe('Campaign objective'),
        tactics: z.array(z.string()).describe('Specific tactics'),
        timeline: z.string().optional(),
        budget: z.string().optional(),
      })
    ).describe('Marketing campaigns'),
    metrics: z.array(
      z.object({
        name: z.string().describe('Metric name'),
        target: z.string().describe('Target value'),
      })
    ).describe('Success metrics and KPIs'),
  }),
  execute: async function ({ title, positioning, targetAudience, channels, campaigns, metrics }) {
    try {
      return {
        title,
        positioning,
        targetAudience,
        channels,
        campaigns,
        metrics,
      };
    } catch (error) {
      console.error('Error in generateMarketingPlan:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating competitor analysis
 * Creates competitive landscape and positioning analysis
 */
export const generateCompetitorAnalysis = createTool({
  description:
    'Generate competitive analysis comparing products, features, pricing, market position, and strengths/weaknesses of competitors. Use this for understanding competitive landscape and differentiation.',
  inputSchema: z.object({
    title: z.string().describe('Analysis title'),
    competitors: z.array(
      z.object({
        name: z.string().describe('Competitor name'),
        description: z.string().describe('Company description'),
        strengths: z.array(z.string()).describe('Key strengths'),
        weaknesses: z.array(z.string()).describe('Key weaknesses'),
        marketShare: z.string().optional().describe('Market share percentage'),
        pricing: z.string().optional().describe('Pricing model'),
        targetMarket: z.string().optional(),
      })
    ).describe('List of competitors'),
    comparisonMatrix: z.array(
      z.object({
        feature: z.string().describe('Feature or criterion being compared'),
        scores: z.record(z.string(), z.union([
          z.string(),
          z.number(),
          z.boolean(),
        ])).describe('Competitor scores/ratings for this feature (key: competitor name)'),
      })
    ).optional().describe('Feature comparison matrix'),
    positioning: z.string().optional().describe('Your competitive positioning and differentiation'),
    recommendations: z.array(z.string()).optional().describe('Strategic recommendations'),
  }),
  execute: async function ({ title, competitors, comparisonMatrix, positioning, recommendations }) {
    try {
      if (!competitors || competitors.length === 0) {
        throw new Error('Must analyze at least one competitor');
      }

      return {
        title,
        competitors,
        comparisonMatrix,
        positioning,
        recommendations,
      };
    } catch (error) {
      console.error('Error in generateCompetitorAnalysis:', error);
      throw error;
    }
  },
});

/**
 * Tool for generating revenue model
 * Creates pricing strategy and revenue stream analysis
 */
export const generateRevenueModel = createTool({
  description:
    'Generate revenue model including pricing strategy, revenue streams, unit economics, and monetization approach. Use this for designing business monetization strategy.',
  inputSchema: z.object({
    title: z.string().describe('Revenue model title'),
    revenueStreams: z.array(
      z.object({
        name: z.string().describe('Revenue stream name'),
        description: z.string().describe('How this stream generates revenue'),
        pricingModel: z.string().describe('Pricing model (e.g., "Subscription", "Usage-based")'),
        pricing: z.array(
          z.object({
            tier: z.string().describe('Pricing tier name'),
            price: z.string().describe('Price point'),
            features: z.array(z.string()).optional(),
          })
        ).optional().describe('Pricing tiers'),
        targetRevenue: z.string().optional(),
      })
    ).describe('Revenue streams'),
    unitEconomics: z.object({
      cac: z.string().optional().describe('Customer Acquisition Cost'),
      ltv: z.string().optional().describe('Lifetime Value'),
      ltvCacRatio: z.string().optional().describe('LTV:CAC ratio'),
      paybackPeriod: z.string().optional().describe('CAC payback period'),
      churnRate: z.string().optional().describe('Monthly/annual churn rate'),
    }).optional().describe('Unit economics metrics'),
    monetizationStrategy: z.string().describe('Overall monetization approach and rationale'),
    competitivePricing: z.string().optional().describe('Competitive pricing analysis'),
  }),
  execute: async function ({ title, revenueStreams, unitEconomics, monetizationStrategy, competitivePricing }) {
    try {
      if (!revenueStreams || revenueStreams.length === 0) {
        throw new Error('Must define at least one revenue stream');
      }

      return {
        title,
        revenueStreams,
        unitEconomics,
        monetizationStrategy,
        competitivePricing,
      };
    } catch (error) {
      console.error('Error in generateRevenueModel:', error);
      throw error;
    }
  },
});

export const businessTools = {
  generateBusinessPlan,
  generateFinancialProjections,
  generateSWOTAnalysis,
  generateBusinessModelCanvas,
  generateMarketAnalysis,
  generatePitchDeck,
  generateFinancialDashboard,
  generateMarketingPlan,
  generateCompetitorAnalysis,
  generateRevenueModel,
};
