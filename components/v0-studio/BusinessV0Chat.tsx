"use client";

import { BaseV0Chat } from "./BaseV0Chat";
import { Briefcase } from "lucide-react";

export function BusinessV0Chat() {
  return (
    <BaseV0Chat
      title="Business Studio"
      subtitle="AI-Powered Business Applications"
      icon={<Briefcase className="h-5 w-5 text-blue-500" />}
      emptyStateTitle="What business tool should we create?"
      emptyStateDescription="Generate dashboards, analytics tools, CRM interfaces, and business applications with AI assistance."
      examplePrompts={[
        "Create a sales dashboard with KPI metrics",
        "Build a customer relationship manager",
        "Design an invoice generator and tracker",
        "Make a project management kanban board",
        "Create an employee performance tracker",
        "Build a financial forecasting dashboard",
      ]}
      systemPrompt={`You are an expert business application developer specializing in creating professional, data-driven business tools. Create applications with:

- Professional, clean business aesthetics
- Data visualization and analytics displays
- Dashboard layouts with key metrics
- Tables, charts, and reporting interfaces
- Filtering, sorting, and search functionality
- Export capabilities (CSV, PDF)
- Responsive design for desktop and tablet
- Role-based access considerations

Focus on business value, data clarity, and professional UX. Use React, Tailwind CSS, and business-appropriate color schemes. Include charts using Recharts when relevant.`}
    />
  );
}
