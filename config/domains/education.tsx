import type { DomainHubConfig } from "@/components/domain-hub";

export const educationConfig: DomainHubConfig = {
  hero: {
    badge: "Future of Learning",
    title: "Democratizing",
    titleItalic: "Mastery",
    description:
      "An AI-powered educational ecosystem designed to unlock human potential. Personalized, scalable, and deeply engaging.",
    primaryCta: {
      text: "Launch Studio",
      link: "/education/studio",
    },
    secondaryCta: {
      text: "View Pathways",
      link: "#pathways",
    },
  },
  pathways: {
    sectionTitle: "Learning Pathways",
    sectionIcon: "BookOpen",
    items: [
      {
        title: "Adaptive Learning",
        description:
          "Personalized curriculums that evolve in real-time based on student performance and engagement.",
        icon: "BrainCircuit",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        link: "/education/courses",
        action: "Explore Courses",
      },
      {
        title: "Interactive Assessment",
        description:
          "Dynamic quizzes and problem sets that test deep understanding rather than rote memorization.",
        icon: "Puzzle",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        link: "/education/quizzes",
        action: "Take Quiz",
      },
      {
        title: "Content Studio",
        description:
          "Tools for educators to generate lesson plans, visual aids, and interactive materials instantly.",
        icon: "PenTool",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        link: "/education/studio",
        action: "Open Studio",
      },
      {
        title: "Research Assistant",
        description:
          "A specialized companion for navigating academic papers, citations, and complex topics.",
        icon: "Library",
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
        link: "/education/study",
        action: "Start Research",
      },
    ],
  },
  workflow: {
    title: "The Learning Engine",
    description:
      "A pedagogical framework enhanced by machine intelligence.",
    steps: [
      {
        step: "01",
        title: "Assess",
        desc: "Evaluate current knowledge gaps and learning style preferences.",
        icon: "Users",
      },
      {
        step: "02",
        title: "Adapt",
        desc: "Tailor content delivery speed and complexity to the learner.",
        icon: "Sparkles",
      },
      {
        step: "03",
        title: "Advance",
        desc: "Reinforce mastery through spaced repetition and practical application.",
        icon: "GraduationCap",
      },
    ],
  },
  trust: {
    badge: "ACADEMIC STANDARD",
    badgeIcon: "Lightbulb",
    title: "Fostering Genuine",
    titleItalic: "Understanding.",
    description:
      "Our tools are designed to scaffold learning, not bypass it. We prioritize the Socratic method, guiding students to answers rather than simply providing them.",
    features: [
      "Socratic Tutoring Models",
      "Citation & Source Verification",
      "Plagiarism Detection Integration",
      "Curriculum Alignment Standards",
    ],
    featureIcon: "MonitorPlay",
    demo: {
      messages: [
        {
          type: "user",
          content: "Explain the significance of the mitochondria.",
        },
        {
          type: "ai",
          content:
            "Think about how a city gets its power. What role does a power plant play?",
          subtext: "Leading with an analogy...",
        },
      ],
      insight: {
        icon: "Sparkles",
        strong: "Guided Inquiry",
        text: "The model encourages critical thinking by asking follow-up questions instead of giving direct answers.",
      },
    },
  },
};
