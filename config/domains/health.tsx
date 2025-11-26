import type { DomainHubConfig } from "@/components/domain-hub";

export const healthConfig: DomainHubConfig = {
  hero: {
    badge: "Health Intelligence Hub",
    title: "The Future of",
    titleItalic: "Care",
    description:
      "A comprehensive guide and toolkit for applying artificial intelligence in healthcare. Enhancing human expertise with machine precision.",
    primaryCta: {
      text: "Launch Health Assistant",
      link: "/health/chat",
    },
    secondaryCta: {
      text: "Explore The Hub",
      link: "#pathways",
    },
  },
  pathways: {
    sectionTitle: "Knowledge Areas",
    sectionIcon: "Activity",
    items: [
      {
        title: "Clinical Decision Support",
        description:
          "Augmenting diagnostic accuracy with pattern recognition and historical data analysis.",
        icon: "Stethoscope",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        link: "/health/chat",
        action: "Try Diagnostic Aid",
      },
      {
        title: "Personalized Wellness",
        description:
          "Tailoring health plans based on individual biometrics, lifestyle, and genetic factors.",
        icon: "Heart",
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        link: "/health/records",
        action: "View Records",
      },
      {
        title: "Medical Research",
        description:
          "Accelerating drug discovery and analyzing vast datasets to identify new treatments.",
        icon: "Microscope",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        link: "/health/insights",
        action: "Explore Insights",
      },
      {
        title: "Operational Efficiency",
        description:
          "Streamlining hospital workflows, resource allocation, and patient triage systems.",
        icon: "Database",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        link: "/health/chat?mode=admin",
        action: "Optimize Workflow",
      },
    ],
  },
  workflow: {
    title: "Human-AI Collaboration Workflow",
    description:
      "A transparent view of how data flows from patient records to actionable clinical insights.",
    steps: [
      {
        step: "01",
        title: "Data Ingestion",
        desc: "Securely process multimodal inputs: labs, imaging, and notes.",
        icon: "FileText",
      },
      {
        step: "02",
        title: "Secure Analysis",
        desc: "AI models process data in a HIPAA-compliant environment.",
        icon: "Brain",
      },
      {
        step: "03",
        title: "Actionable Insights",
        desc: "Receive evidence-based recommendations for clinical review.",
        icon: "Zap",
      },
    ],
  },
  trust: {
    badge: "TRUST & SAFETY",
    badgeIcon: "Shield",
    title: "Built for Privacy First.",
    titleItalic: "Never compromised.",
    description:
      "Our architecture ensures that patient data never leaves your secure environment without explicit authorization. We utilize local inference where possible and enterprise-grade encryption for all transmissions.",
    features: [
      "HIPAA Compliant Infrastructure",
      "Zero-Retention Data Policy",
      "Human-in-the-Loop Verification",
      "Role-Based Access Control",
    ],
    featureIcon: "Lock",
  },
};
