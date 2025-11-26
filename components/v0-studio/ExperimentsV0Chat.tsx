"use client";

import { ThemedV0Chat } from "./ThemedV0Chat";
import { Hammer, Sparkles } from "lucide-react";

export function ExperimentsV0Chat() {
  return (
    <ThemedV0Chat
      title="v0 Builder"
      subtitle="Experimental UI Generator"
      badge="Beta"
      icon={<Sparkles className="h-5 w-5 text-purple-500" />}
      emptyStateTitle="What can we build together?"
      emptyStateDescription="Experimental playground for the v0.dev clone. Generate React components with Tailwind CSS using the latest Vercel AI SDK."
      placeholder="Describe the component you want to build..."
      examplePrompts={[
        "Create a responsive navbar with Tailwind CSS",
        "Build a todo app with React and Framer Motion",
        "Make a landing page for a coffee shop",
        "Design a credit card checkout form",
        "Create a dashboard sidebar navigation",
        "Build a pricing table with toggle"
      ]}
      systemPrompt={`You are an expert React developer specializing in Tailwind CSS. You are running in an experimental "v0 clone" environment.
      
Your goal is to generate high-quality, responsive, and interactive UI components.
- Use React functional components
- Use Tailwind CSS for styling
- Use Lucide React for icons
- Ensure code is clean and production-ready
- If requested, use Framer Motion for animations

Always return the full code for the component.`}
    />
  );
}

