"use client";

import { ThemedV0Chat } from "./ThemedV0Chat";
import { GraduationCap } from "lucide-react";

export function EducationV0Chat() {
  return (
    <ThemedV0Chat
      title="Education Studio"
      subtitle="AI-Powered Educational Content"
      badge="Education OS"
      icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
      primaryColor="#4f46e5"
      emptyStateTitle="What educational content should we create?"
      emptyStateDescription="Generate interactive lessons, quizzes, study materials, and educational apps with AI assistance."
      placeholder="Describe your educational content..."
      examplePrompts={[
        "Create an interactive quiz on the water cycle",
        "Build a multiplication practice game for 3rd graders",
        "Design a timeline explorer for World War II",
        "Make a periodic table with element details",
        "Create a typing tutor for beginners",
        "Build a flashcard app for vocabulary learning",
      ]}
      systemPrompt={`You are an expert educational content creator specializing in creating comprehensive, engaging educational materials. Create well-structured content with:

- Clear explanations appropriate for the target age/grade level
- Interactive elements that engage students
- Visual aids, diagrams, and examples
- Practice exercises and assessments
- Accessibility features for diverse learners
- Modern, mobile-friendly responsive design
- Gamification elements when appropriate

Focus on pedagogy-first design with learning objectives clearly addressed. Use React and Tailwind CSS for implementation.`}
    />
  );
}
