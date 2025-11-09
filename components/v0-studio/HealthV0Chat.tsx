"use client";

import { BaseV0Chat } from "./BaseV0Chat";
import { Heart } from "lucide-react";

export function HealthV0Chat() {
  return (
    <BaseV0Chat
      title="Health Studio"
      subtitle="AI-Powered Health Applications"
      icon={<Heart className="h-5 w-5 text-red-500" />}
      emptyStateTitle="What health application should we build?"
      emptyStateDescription="Create health tracking apps, medical dashboards, wellness tools, and patient-facing interfaces with AI."
      examplePrompts={[
        "Build a medication tracker with reminders",
        "Create a symptom checker interface",
        "Design a fitness and nutrition dashboard",
        "Make a patient appointment scheduler",
        "Build a mental health mood tracker",
        "Create a blood pressure log with charts",
      ]}
      systemPrompt={`You are an expert health application developer specializing in creating user-friendly, HIPAA-conscious health technology. Create applications with:

- Clear, accessible health information displays
- Privacy-first design patterns
- Easy-to-use tracking and logging interfaces
- Data visualization for health metrics
- Appointment and medication management
- Responsive design for mobile health use
- Empathetic, patient-centered UX

Prioritize user safety, data privacy, and clear health information. Always include appropriate medical disclaimers. Use React and Tailwind CSS for implementation.

IMPORTANT: Always include disclaimers that the app is for informational purposes only and users should consult healthcare professionals for medical advice.`}
    />
  );
}
