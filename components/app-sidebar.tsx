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
  Network,
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
import { ThemeToggle } from "@/components/theme-toggle"

// This is sample data.
const data = {
  user: {
    name: "Hacker",
    email: "hackr@hackprinceton.hack",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Augment",
      logo: GalleryVerticalEnd,
      plan: "Hacker",
    },
  ],
  navMain: [
    {
      title: "Platform",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Main Chat",
          url: "/chat",
        },
        {
          title: "Playground",
          url: "/playground",
        },
        {
          title: "Workflows",
          url: "/workflow",
        },
        {
          title: "Open Lovable",
          url: "/open-lovable",
          items: [
            {
              title: "Overview",
              url: "/open-lovable",
            },
            {
              title: "Generation",
              url: "/open-lovable/generation",
            },
            {
              title: "Builder",
              url: "/open-lovable/builder",
            },
          ],
        },
      ],
    },
    {
      title: "Experiments",
      url: "#",
      icon: Network,
      items: [
        {
          title: "v0 Clone",
          url: "/experiments",
        },
        {
          title: "Agents",
          url: "/experiments/agents",
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
          title: "Build Activities",
          url: "/education/studio",
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
          title: "Build Accountability",
          url: "/health/studio",
        },
        {
          title: "Medical Records",
          url: "/health/records",
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
          title: "Build Solutions",
          url: "/business/studio",
        },
      ],
    },
    {
      title: "Sustainability",
      url: "#",
      icon: Leaf,
      items: [
        {
          title: "AI Energy Resources",
          url: "/sustainability/ai-energy-resources",
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
        {
          title: "Workflow",
          url: "/sustainability/workflow",
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
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
