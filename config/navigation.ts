import {
  GraduationCap,
  Heart,
  Briefcase,
  Leaf,
  Sparkles,
  Hammer,
  Info,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  description?: string
  isActive?: boolean
  items?: NavItem[]
}

export interface NavigationConfig {
  navMain: NavItem[]
}

/**
 * Main navigation configuration for the application
 * Organized into three main categories:
 * 1. Core Tools - Primary platform features and tools
 * 2. Domain Studios - Vertical-specific AI applications
 * 3. Developer Tools - Advanced features for development
 */
export const navigationConfig: NavigationConfig = {
  navMain: [
    {
      title: "Core Tools",
      url: "#",
      icon: Sparkles,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
          description: "Platform overview and getting started",
        },
        {
          title: "About",
          url: "/about",
          icon: Info,
          description: "Learn more about Augment and our mission",
        },
        {
          title: "Universal Assistant",
          url: "/chat",
          description: "Multi-domain AI chat with advanced tool support",
        },
        {
          title: "Workflows",
          url: "/workflow",
          description: "Visual workflow diagrams and automation",
        },
        {
          title: "Interactive Insights",
          url: "/interactive",
          description: "Article analysis with embedded AI chat",
        },
        {
          title: "Interactive Demos",
          url: "/interactive-demos",
          description: "Generate AI demos from any URL",
        },
        {
          title: "v0 Builder",
          url: "/experiments",
          description: "Split-screen UI builder with AI preview",
        },
        {
          title: "Agents Lab",
          url: "/experiments/agents",
          description: "Interactive agent playground and documentation",
        },
      ],
    },
    {
      title: "Domain Studios",
      url: "#",
      icon: Hammer,
      items: [
        {
          title: "Education",
          url: "/education",
          icon: GraduationCap,
          description: "Learning pathways and textbook generation",
          items: [
            {
              title: "Education Hub",
              url: "/education",
            },
            {
              title: "Build Activities",
              url: "/education/studio",
            },
          ],
        },
        {
          title: "Health",
          url: "/health",
          icon: Heart,
          description: "Clinical support and wellness tracking",
          items: [
            {
              title: "Health Hub",
              url: "/health",
            },
            {
              title: "Build Accountability",
              url: "/health/studio",
            },
          ],
        },
        {
          title: "Business",
          url: "/business",
          icon: Briefcase,
          description: "Market analytics and financial modeling",
          items: [
            {
              title: "Business Hub",
              url: "/business",
            },
            {
              title: "Build Solutions",
              url: "/business/studio",
            },
          ],
        },
        {
          title: "Sustainability",
          url: "/sustainability",
          icon: Leaf,
          description: "Carbon tracking and ESG reporting",
          items: [
            {
              title: "Sustainability Hub",
              url: "/sustainability",
            },
            {
              title: "Carbon Tracking",
              url: "/sustainability/carbon",
            },
            {
              title: "Develop Tools",
              url: "/sustainability/studio",
            },
            {
              title: "Impact Reports",
              url: "/sustainability/impact",
            },
          ],
        },
      ],
    },
  ],
}

// User data configuration
export const userData = {
  name: "Hacker",
  email: "hackr@hackprinceton.hack",
  avatar: "/avatars/user.jpg",
}

// Team/workspace configuration
export const teamsData = [
  {
    name: "Augment",
    logo: "GalleryVerticalEnd" as const,
    plan: "Hacker",
  },
]
