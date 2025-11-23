import {
  CEREBRAS_MODELS,
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
} from "@/lib/constants";
import { createCerebras } from "@ai-sdk/cerebras";
import { gateway } from "@/lib/gateway";
// TODO: Re-enable middleware wrappers after fixing AI SDK v5 compatibility issue
// import { wrapCerebrasModel } from "@/lib/cerebras-wrapper";
// import { wrapGatewayModel } from "@/lib/gateway-wrapper";
import type { LanguageModel } from "ai";
import {
  generateBusinessPlanStructured,
  generateFinancialProjectionsStructured,
  generateMarketAnalysisStructured,
  generateCompetitorAnalysisStructured,
  generateBusinessAnalyses,
  type BusinessAnalysisRequest,
} from "@/lib/business-generators";

export const maxDuration = 60;

type AnalysisType = 'businessPlan' | 'financialProjections' | 'marketAnalysis' | 'competitorAnalysis' | 'all';

interface RequestBody {
  analysisType: AnalysisType;
  modelId?: string;
  params: {
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
  };
}

function resolveModel(modelId: string): LanguageModel {
  const isCerebrasModel = CEREBRAS_MODELS.includes(modelId);

  // Validate API keys
  if (isCerebrasModel) {
    if (!process.env.CEREBRAS_API_KEY) {
      throw new Error("CEREBRAS_API_KEY is required for Cerebras models");
    }
  } else {
    if (!process.env.AI_GATEWAY_API_KEY) {
      throw new Error("AI_GATEWAY_API_KEY is required for gateway models");
    }
  }

  const cleanedModelId = isCerebrasModel
    ? modelId.replace(/^cerebras\//, "")
    : modelId;

  let model: LanguageModel;
  if (isCerebrasModel) {
    const baseModel = createCerebras({
      apiKey: process.env.CEREBRAS_API_KEY!,
    })(cleanedModelId);
    // Middleware wrapper disabled due to AI SDK v5 compatibility issue
    // TODO: Re-enable wrapCerebrasModel(baseModel, { enableCaching: true }) after fix
    model = baseModel;
  } else {
    const baseModel = gateway(modelId);
    // Middleware wrapper disabled due to AI SDK v5 compatibility issue
    // TODO: Re-enable wrapGatewayModel(baseModel, { enableCaching: true }) after fix
    model = baseModel;
  }

  return model;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const {
      analysisType,
      modelId = DEFAULT_MODEL,
      params,
    } = body;

    if (!SUPPORTED_MODELS.includes(modelId)) {
      return new Response(
        JSON.stringify({ error: `Model ${modelId} is not supported` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = resolveModel(modelId);

    let result;

    if (analysisType === 'businessPlan' && params.businessPlan) {
      result = await generateBusinessPlanStructured(model, params.businessPlan);
    } else if (analysisType === 'financialProjections' && params.financialProjections) {
      result = await generateFinancialProjectionsStructured(model, params.financialProjections);
    } else if (analysisType === 'marketAnalysis' && params.marketAnalysis) {
      result = await generateMarketAnalysisStructured(model, params.marketAnalysis);
    } else if (analysisType === 'competitorAnalysis' && params.competitorAnalysis) {
      result = await generateCompetitorAnalysisStructured(model, params.competitorAnalysis);
    } else if (analysisType === 'all') {
      // Generate all requested analyses in parallel
      const businessAnalysisRequest: BusinessAnalysisRequest = {};
      if (params.businessPlan) businessAnalysisRequest.businessPlan = params.businessPlan;
      if (params.financialProjections) businessAnalysisRequest.financialProjections = params.financialProjections;
      if (params.marketAnalysis) businessAnalysisRequest.marketAnalysis = params.marketAnalysis;
      if (params.competitorAnalysis) businessAnalysisRequest.competitorAnalysis = params.competitorAnalysis;

      result = await generateBusinessAnalyses(model, businessAnalysisRequest);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid analysis type or missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        analysisType,
        modelId,
        data: result.object || result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Business Analyst Structured] Error:", error);

    const status = error.message?.includes("API_KEY") ? 500 : 400;
    const errorMessage = error.message || "Failed to generate structured business analysis";

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.message?.includes("API_KEY")
          ? "Please check your environment variables"
          : undefined,
      }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}
