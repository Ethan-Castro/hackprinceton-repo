import { tools } from "@/lib/tools";
import { healthTools } from "@/lib/health-tools";

type TestCase = {
  name: string;
  run: () => Promise<unknown>;
  skipReason?: string;
};

const sampleHtml = `
<!DOCTYPE html>
<html>
  <body style="font-family:system-ui;padding:1rem;">
    <h1>Sample Diagram</h1>
    <p>This is placeholder html for preview tests.</p>
  </body>
</html>
`.trim();

const testCases: TestCase[] = [
  {
    name: "displayArtifact",
    run: () =>
      tools.displayArtifact.execute({
        title: "QA Artifact",
        description: "Ensures artifacts render",
        content: "This is a functional test of the artifact tool.",
        contentType: "text",
      }),
  },
  {
    name: "displayWebPreview",
    run: () =>
      tools.displayWebPreview.execute({
        url: "https://example.com",
        title: "Example Domain",
      }),
  },
  {
    name: "generateHtmlPreview",
    run: () =>
      tools.generateHtmlPreview.execute({
        html: sampleHtml,
        title: "Inline Preview",
      }),
  },
  {
    name: "generateTextbookChapter",
    run: () =>
      tools.generateTextbookChapter.execute({
        title: "Sample Chapter",
        introduction: "Overview of sample topic.",
        sections: [
          {
            heading: "Section A",
            content: "Content **A** in markdown.",
          },
        ],
        conclusion: "Wrap-up.",
      }),
  },
  {
    name: "generateExercises",
    run: () =>
      tools.generateExercises.execute({
        title: "Quick Quiz",
        exercises: [
          {
            question: "What is 2 + 2?",
            type: "multiple-choice",
            options: ["3", "4"],
            correctAnswer: "4",
            explanation: "Basic arithmetic",
          },
        ],
      }),
  },
  {
    name: "generateDiagram",
    run: () =>
      tools.generateDiagram.execute({
        title: "Flow",
        description: "Simple diagram",
        html: "<div>Diagram</div>",
        type: "flowchart",
      }),
  },
  {
    name: "generateCodeExample",
    run: () =>
      tools.generateCodeExample.execute({
        title: "Adder",
        description: "Adds two numbers",
        code: "const add = (a,b) => a + b;",
        language: "javascript",
        explanation: "Simple addition function.",
      }),
  },
  {
    name: "generateKeyPoints",
    run: () =>
      tools.generateKeyPoints.execute({
        title: "Highlights",
        points: [
          { heading: "Point A", description: "Detail A" },
          { heading: "Point B", description: "Detail B" },
        ],
      }),
  },
  {
    name: "generateCaseStudy",
    run: () =>
      tools.generateCaseStudy.execute({
        title: "Retail Rollout",
        context: "Expanding stores",
        scenario: "Need launch plan",
        analysis: "Evaluate markets",
        outcome: "Successful pilot",
        takeaways: ["Focus on demand", "Align ops"],
      }),
  },
  {
    name: "generateMindMap",
    run: () =>
      tools.generateMindMap.execute({
        centralTopic: "Wellness",
        branches: [
          {
            title: "Nutrition",
            children: [{ title: "Macros" }],
          },
        ],
      }),
  },
  {
    name: "generateBusinessPlan",
    run: () =>
      tools.generateBusinessPlan.execute({
        companyName: "TestCo",
        executiveSummary: "We build tests.",
        sections: [
          { title: "Market", content: "Large TAM." },
        ],
      }),
  },
  {
    name: "generateFinancialProjections",
    run: () =>
      tools.generateFinancialProjections.execute({
        title: "3-Year Outlook",
        timeframe: "3 Years",
        revenueStreams: [
          {
            name: "Subscriptions",
            projections: [
              { period: "Year 1", amount: 100_000 },
            ],
          },
        ],
        expenses: [
          {
            category: "Ops",
            projections: [{ period: "Year 1", amount: 50_000 }],
          },
        ],
        assumptions: ["Stable churn"],
      }),
  },
  {
    name: "generateSWOTAnalysis",
    run: () =>
      tools.generateSWOTAnalysis.execute({
        title: "SWOT",
        context: "Launch",
        strengths: [{ title: "Brand", description: "Strong" }],
        weaknesses: [{ title: "Budget", description: "Tight" }],
        opportunities: [{ title: "New market", description: "Growing" }],
        threats: [{ title: "Competition", description: "High" }],
      }),
  },
  {
    name: "generateBusinessModelCanvas",
    run: () =>
      tools.generateBusinessModelCanvas.execute({
        businessName: "CanvasCo",
        valuePropositions: ["Speed"],
        customerSegments: ["SMB"],
        channels: ["Web"],
        customerRelationships: ["Self-serve"],
        revenueStreams: ["Subscription"],
        keyResources: ["Platform"],
        keyActivities: ["Development"],
        keyPartners: ["Vendors"],
        costStructure: ["Cloud"],
      }),
  },
  {
    name: "generateMarketAnalysis",
    run: () =>
      tools.generateMarketAnalysis.execute({
        title: "Market Study",
        industry: "AI",
        marketSize: {
          tam: { value: "$10B", description: "Global" },
        },
        trends: [{ title: "Automation", description: "Growing" }],
        customerSegments: [{ name: "Startups", description: "Early adopters" }],
        competitiveLandscape: "Fragmented",
      }),
  },
  {
    name: "generatePitchDeck",
    run: () =>
      tools.generatePitchDeck.execute({
        companyName: "PitchCo",
        tagline: "Pitch better",
        slides: [
          { title: "Problem", type: "problem", content: "Teams need help." },
        ],
      }),
  },
  {
    name: "generateFinancialDashboard",
    run: () =>
      tools.generateFinancialDashboard.execute({
        title: "Q1 Dashboard",
        period: "Q1 2025",
        kpis: [{ name: "MRR", value: "$50k" }],
        charts: [
          {
            title: "MRR Trend",
            type: "line",
            data: [
              { label: "Jan", value: 40 },
              { label: "Feb", value: 45 },
            ],
          },
        ],
      }),
  },
  {
    name: "generateMarketingPlan",
    run: () =>
      tools.generateMarketingPlan.execute({
        title: "GTM Plan",
        positioning: "Fastest option",
        targetAudience: [
          { segment: "Ops", description: "Ops teams" },
        ],
        channels: [
          { name: "Content", strategy: "Guides" },
        ],
        campaigns: [
          { name: "Launch", objective: "Awareness", tactics: ["Webinar"] },
        ],
        metrics: [
          { name: "SQLs", target: "200" },
        ],
      }),
  },
  {
    name: "generateCompetitorAnalysis",
    run: () =>
      tools.generateCompetitorAnalysis.execute({
        title: "Competitive Grid",
        competitors: [
          {
            name: "Competitor A",
            description: "Legacy tool",
            strengths: ["Brand"],
            weaknesses: ["Speed"],
          },
        ],
      }),
  },
  {
    name: "generateRevenueModel",
    run: () =>
      tools.generateRevenueModel.execute({
        title: "Revenue Model",
        revenueStreams: [
          {
            name: "Pro",
            description: "Subscription",
            pricingModel: "Subscription",
            pricing: [{ tier: "Pro", price: "$49" }],
          },
        ],
        monetizationStrategy: "Hybrid",
      }),
  },
  {
    name: "searchArXiv",
    run: () =>
      tools.searchArXiv.execute({
        query: "machine learning",
        maxResults: 2,
      }),
  },
  {
    name: "getArXivPaper",
    run: () =>
      tools.getArXivPaper.execute({
        paperId: "1707.08567",
      }),
  },
  {
    name: "browseUrl",
    run: () =>
      healthTools.browseUrl.execute({
        url: "https://www.cdc.gov/physicalactivity/basics/adults/index.htm",
      }),
  },
  {
    name: "saveTrackerEntry",
    skipReason: "Requires Neo4j credentials (NEO4J_URI/USERNAME/PASSWORD)",
    run: async () => {},
  },
  {
    name: "indexReport",
    skipReason: "Requires Neo4j credentials (NEO4J_URI/USERNAME/PASSWORD)",
    run: async () => {},
  },
  {
    name: "readGoogleDoc",
    skipReason: "Requires GOOGLE_CREDENTIALS_PATH and Google Doc access",
    run: async () => {},
  },
  {
    name: "getGoogleDocMetadata",
    skipReason: "Requires GOOGLE_CREDENTIALS_PATH and Google Doc access",
    run: async () => {},
  },
  {
    name: "generateGamma",
    skipReason: "Requires GAMMA_API_KEY",
    run: async () => {},
  },
  {
    name: "getGammaGeneration",
    skipReason: "Requires GAMMA_API_KEY and generation ID",
    run: async () => {},
  },
  {
    name: "exportGamma",
    skipReason: "Requires GAMMA_API_KEY and generation ID",
    run: async () => {},
  },
  {
    name: "listGammaThemes",
    skipReason: "Requires GAMMA_API_KEY",
    run: async () => {},
  },
];

type TestResult = {
  name: string;
  status: "passed" | "failed" | "skipped";
  detail?: string;
};

async function main() {
  const results: TestResult[] = [];
  for (const test of testCases) {
    if (test.skipReason) {
      results.push({ name: test.name, status: "skipped", detail: test.skipReason });
      console.log(`⚪️  ${test.name}: skipped (${test.skipReason})`);
      continue;
    }
    try {
      await test.run();
      results.push({ name: test.name, status: "passed" });
      console.log(`✅  ${test.name}: passed`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      results.push({ name: test.name, status: "failed", detail });
      console.error(`❌  ${test.name}: failed - ${detail}`);
    }
  }

  const failed = results.filter((r) => r.status === "failed");
  if (failed.length > 0) {
    console.error(`\n${failed.length} tool tests failed.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll runnable tool tests passed.");
  }
}

main().catch((error) => {
  console.error("Unexpected error running tool tests:", error);
  process.exitCode = 1;
});
