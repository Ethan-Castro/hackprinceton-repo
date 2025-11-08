"use client"

import * as React from "react"
import {
  BookOpen,
  GraduationCap,
  Heart,
  Briefcase,
  Leaf,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "AI Gateway",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "/playground",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Chat Interface",
          url: "/playground",
        },
      ],
    },
    {
      title: "Education",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Textbook Studio",
          url: "/education",
        },
        {
          title: "v0 Clone Example",
          url: "/examples/v0",
        },
        {
          title: "Course Builder",
          url: "/education/courses",
        },
        {
          title: "Quiz Generator",
          url: "/education/quizzes",
        },
        {
          title: "Study Assistant",
          url: "/education/study",
        },
      ],
    },
    {
      title: "Health",
      url: "#",
      icon: Heart,
      items: [
        {
          title: "Health Chat",
          url: "/health",
        },
        {
          title: "Medical Records",
          url: "/health/records",
        },
        {
          title: "Treatment Plans",
          url: "/health/treatment",
        },
        {
          title: "Health Insights",
          url: "/health/insights",
        },
      ],
    },
    {
      title: "Business",
      url: "#",
      icon: Briefcase,
      items: [
        {
          title: "Business Chat",
          url: "/business",
        },
        {
          title: "Analytics",
          url: "/business/analytics",
        },
        {
          title: "Reports",
          url: "/business/reports",
        },
        {
          title: "Strategy",
          url: "/business/strategy",
        },
      ],
    },
    {
      title: "Sustainability",
      url: "#",
      icon: Leaf,
      items: [
        {
          title: "Carbon Tracking",
          url: "/sustainability/carbon",
        },
        {
          title: "Impact Reports",
          url: "/sustainability/impact",
        },
        {
          title: "Green Initiatives",
          url: "/sustainability/initiatives",
        },
        {
          title: "ESG Metrics",
          url: "/sustainability/esg",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Recent Projects",
      url: "#",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
