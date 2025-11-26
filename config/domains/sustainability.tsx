import type { DomainHubConfig } from "@/components/domain-hub";

export const sustainabilityConfig: DomainHubConfig = {
  hero: {
    badge: "Climate Action Platform",
    title: "Building a",
    titleItalic: "Sustainable",
    description:
      "Data-driven environmental intelligence for organizations committed to measurable climate action. Track, analyze, and optimize your environmental impact with AI-powered insights.",
    primaryCta: {
      text: "Launch Carbon Tracker",
      link: "/sustainability/carbon",
    },
    secondaryCta: {
      text: "View Solutions",
      link: "#pathways",
    },
  },
  pathways: {
    sectionTitle: "Sustainability Solutions",
    sectionIcon: "Leaf",
    items: [
      {
        title: "Carbon Tracking",
        description:
          "Real-time carbon footprint monitoring across operations, supply chain, and product lifecycle.",
        icon: "Factory",
        color: "text-green-500",
        bg: "bg-green-500/10",
        link: "/sustainability/carbon",
        action: "Track Emissions",
      },
      {
        title: "ESG Reporting",
        description:
          "Automated compliance reports for environmental, social, and governance frameworks.",
        icon: "FileBarChart",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        link: "/sustainability/impact",
        action: "Generate Report",
      },
      {
        title: "Impact Analytics",
        description:
          "Predictive modeling and scenario planning for sustainable business transformation.",
        icon: "BarChart3",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        link: "/sustainability/impact",
        action: "Analyze Impact",
      },
      {
        title: "Green Technology",
        description:
          "AI-powered recommendations for renewable energy adoption and resource optimization.",
        icon: "Wind",
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
        link: "/sustainability/studio",
        action: "Explore Solutions",
      },
    ],
  },
  workflow: {
    title: "Sustainability Intelligence Pipeline",
    description:
      "From data collection to actionable climate strategies, powered by AI.",
    steps: [
      {
        step: "01",
        title: "Measure",
        desc: "Collect emissions data from operations, energy use, and supply chains.",
        icon: "Database",
      },
      {
        step: "02",
        title: "Analyze",
        desc: "Identify hotspots and opportunities for reduction using AI models.",
        icon: "TrendingDown",
      },
      {
        step: "03",
        title: "Optimize",
        desc: "Implement data-driven strategies to achieve net-zero targets.",
        icon: "Target",
      },
    ],
  },
  trust: {
    badge: "VERIFIED STANDARDS",
    badgeIcon: "ShieldCheck",
    title: "Science-Based.",
    titleItalic: "Transparently Auditable.",
    description:
      "Our carbon calculations align with GHG Protocol standards and are verified by third-party auditors. All methodologies are open and traceable.",
    features: [
      "GHG Protocol Compliant",
      "Science-Based Targets Initiative (SBTi) Aligned",
      "CDP Reporting Framework Support",
      "ISO 14064 Verification Ready",
    ],
    featureIcon: "Sprout",
    demo: {
      messages: [
        {
          type: "user",
          content: "What's our largest source of Scope 2 emissions?",
        },
        {
          type: "ai",
          content:
            "Based on your 2024 energy data, data centers account for 68% of Scope 2 emissions. Would you like me to model the impact of switching to renewable energy contracts?",
          subtext: "Analyzing energy consumption patterns...",
        },
      ],
      insight: {
        icon: "Lightbulb",
        strong: "Actionable Intelligence",
        text: "The system automatically identifies reduction opportunities and quantifies potential impact before implementation.",
      },
    },
  },
};
