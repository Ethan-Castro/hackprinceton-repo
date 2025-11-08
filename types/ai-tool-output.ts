import type { ComponentProps } from "react";
import type { TextbookChapter } from "@/components/ai-elements/textbook/TextbookChapter";
import type { Exercise } from "@/components/ai-elements/textbook/Exercise";
import type { Diagram } from "@/components/ai-elements/textbook/Diagram";
import type { CodeExample } from "@/components/ai-elements/textbook/CodeExample";
import type { KeyPoints } from "@/components/ai-elements/textbook/KeyPoints";
import type { MindMap } from "@/components/ai-elements/textbook/MindMap";
import type { BusinessPlan } from "@/components/ai-elements/business/BusinessPlan";
import type { FinancialProjections } from "@/components/ai-elements/business/FinancialProjections";
import type { SWOTMatrix } from "@/components/ai-elements/business/SWOTMatrix";
import type { BusinessModelCanvas } from "@/components/ai-elements/business/BusinessModelCanvas";
import type { MarketAnalysis } from "@/components/ai-elements/business/MarketAnalysis";
import type { PitchDeck } from "@/components/ai-elements/business/PitchDeck";
import type { FinancialDashboard } from "@/components/ai-elements/business/FinancialDashboard";
import type { CompetitorTable } from "@/components/ai-elements/business/CompetitorTable";

export type TextbookChapterPayload = ComponentProps<typeof TextbookChapter>;
export type ExercisePayload = ComponentProps<typeof Exercise>;
export type DiagramPayload = ComponentProps<typeof Diagram>;
export type CodeExamplePayload = ComponentProps<typeof CodeExample>;
export type KeyPointsPayload = ComponentProps<typeof KeyPoints>;
export type MindMapPayload = ComponentProps<typeof MindMap>;

export type CaseStudyPayload = {
  title: string;
  context: string;
  scenario: string;
  analysis: string;
  outcome: string;
  takeaways: string[];
};

export type BusinessPlanPayload = ComponentProps<typeof BusinessPlan>;
export type FinancialProjectionsPayload = ComponentProps<typeof FinancialProjections>;
export type SWOTMatrixPayload = ComponentProps<typeof SWOTMatrix>;
export type BusinessModelCanvasPayload = ComponentProps<typeof BusinessModelCanvas>;
export type MarketAnalysisPayload = ComponentProps<typeof MarketAnalysis>;
export type PitchDeckPayload = ComponentProps<typeof PitchDeck>;
export type FinancialDashboardPayload = ComponentProps<typeof FinancialDashboard>;
export type CompetitorTablePayload = ComponentProps<typeof CompetitorTable>;

export type MarketingPlanPayload = {
  title: string;
  positioning: string;
  targetAudience: Array<{
    segment: string;
    description: string;
    size?: string;
  }>;
  channels: Array<{
    name: string;
    strategy: string;
  }>;
};

export type RevenueModelPayload = {
  title: string;
  revenueStreams: Array<{
    name: string;
    description: string;
    pricingModel: string;
  }>;
  unitEconomics?: {
    cac?: string;
    ltv?: string;
  };
  monetizationStrategy: string;
};
