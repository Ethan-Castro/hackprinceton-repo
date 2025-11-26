import type { DomainHubConfig } from "@/components/domain-hub";

export const businessConfig: DomainHubConfig = {
  hero: {
    badge: "Enterprise Intelligence",
    title: "Operationalizing",
    titleItalic: "Intelligence",
    description:
      "A unified command center for data-driven decision making. Translate complex signals into clear strategic advantages.",
    primaryCta: {
      text: "Launch Business Suite",
      link: "/business-analyst",
    },
    secondaryCta: {
      text: "Explore Capabilities",
      link: "#pathways",
    },
  },
  pathways: {
    sectionTitle: "Strategic Pillars",
    sectionIcon: "Briefcase",
    items: [
      {
        title: "Market Analytics",
        description:
          "Real-time competitive intelligence and trend forecasting to stay ahead of market shifts.",
        icon: "Globe",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        link: "/business/analytics",
        action: "Analyze Market",
      },
      {
        title: "Financial Modeling",
        description:
          "Predictive revenue models and risk assessment scenarios powered by historical data.",
        icon: "TrendingUp",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        link: "/business-analyst",
        action: "Start Modeling",
      },
      {
        title: "Strategic Planning",
        description:
          "Optimize resource allocation and test strategic hypotheses in a risk-free simulation environment.",
        icon: "Target",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        link: "/business/strategy",
        action: "Build Strategy",
      },
      {
        title: "Automated Reporting",
        description:
          "Generate comprehensive executive summaries and stakeholder presentations in seconds.",
        icon: "PieChart",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        link: "/business/reports",
        action: "Generate Report",
      },
    ],
  },
  workflow: {
    title: "Data-to-Decision Pipeline",
    description:
      "End-to-end intelligence synthesis from disparate sources to actionable strategy.",
    steps: [
      {
        step: "01",
        title: "Aggregate",
        desc: "Ingest data from internal KPIs, public markets, and competitor signals.",
        icon: "Layers",
      },
      {
        step: "02",
        title: "Synthesize",
        desc: "Detect hidden patterns and correlations using advanced inference.",
        icon: "Zap",
      },
      {
        step: "03",
        title: "Execute",
        desc: "Deliver actionable strategic recommendations to leadership.",
        icon: "BarChart3",
      },
    ],
  },
  trust: {
    badge: "ENTERPRISE GRADE",
    badgeIcon: "ShieldCheck",
    title: "Security at Scale.",
    titleItalic: "Zero compromise.",
    description:
      "Deployed on your private infrastructure or our secure cloud. We adhere to strict data sovereignty principles, ensuring your proprietary intelligence remains yours.",
    features: [
      "SOC2 Type II Certified",
      "Role-Based Access Control (RBAC)",
      "Audit Logs & Compliance Reporting",
      "Single Sign-On (SSO) Integration",
    ],
    featureIcon: "Users",
  },
};
