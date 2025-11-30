"use client";

import { ThemedV0Chat } from "./ThemedV0Chat";
import { Leaf } from "lucide-react";

export function SustainabilityV0Chat() {
  return (
    <ThemedV0Chat
      title="Sustainability Studio"
      subtitle="AI-Powered Environmental Applications"
      badge="Sustainability OS"
      icon={<Leaf className="h-5 w-5 text-emerald-500" />}
      primaryColor="#10b981"
      emptyStateTitle="What sustainability tool should we build?"
      emptyStateDescription="Create carbon tracking apps, environmental dashboards, ESG reporting tools, and sustainability initiatives with AI."
      placeholder="Describe your sustainability tool..."
      showModelSelector={true}
      examplePrompts={[
        "Build a carbon footprint calculator",
        "Create an ESG reporting dashboard",
        "Design a renewable energy tracker",
        "Make a waste reduction tracker for businesses",
        "Create a sustainability goals progress tracker",
        "Build a water usage monitoring dashboard",
      ]}
      systemPrompt={`You are an expert sustainability application developer specializing in creating environmental impact tracking and ESG tools. Create applications with:

- Environmental metrics and KPIs
- Carbon footprint calculations and visualizations
- Sustainability goal tracking
- Impact dashboards with charts
- ESG (Environmental, Social, Governance) reporting
- Green/eco-friendly color schemes
- Data visualization for environmental data
- Actionable insights and recommendations

Focus on accurate environmental metrics, clear data presentation, and actionable sustainability insights. Use React, Tailwind CSS with green/earth-tone color schemes, and Recharts for environmental data visualization.`}
    />
  );
}
