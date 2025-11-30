"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  Briefcase,
  Database,
  Factory,
  FileBarChart,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Leaf,
  Layers,
  Library,
  Lightbulb,
  Lock,
  Microscope,
  MonitorPlay,
  PenTool,
  PieChart,
  Puzzle,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainHeroAnimation, type DomainType } from "@/components/three";

const iconMap = {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  Briefcase,
  Database,
  Factory,
  FileBarChart,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Leaf,
  Layers,
  Library,
  Lightbulb,
  Lock,
  Microscope,
  MonitorPlay,
  PenTool,
  PieChart,
  Puzzle,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wind,
  Zap,
} as const;

export type IconName = keyof typeof iconMap;

function getIcon(name: IconName) {
  return iconMap[name] ?? null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export interface PathwayItem {
  title: string;
  description: string;
  icon: IconName;
  color: string;
  bg: string;
  link: string;
  action: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  desc: string;
  icon: IconName;
}

export interface TrustSection {
  badge: string;
  badgeIcon: IconName;
  title: string;
  titleItalic: string;
  description: string;
  features: string[];
  featureIcon: IconName;
  demo?: {
    messages: Array<{
      type: 'user' | 'ai';
      content: string;
      subtext?: string;
    }>;
    insight?: {
      icon: IconName;
      text: string;
      strong: string;
    };
  };
}

export interface DomainHubConfig {
  hero: {
    badge: string;
    title: string;
    titleItalic: string;
    description: string;
    primaryCta: {
      text: string;
      link: string;
    };
    secondaryCta?: {
      text: string;
      link: string;
    };
  };
  pathways: {
    sectionTitle: string;
    sectionIcon: IconName;
    items: PathwayItem[];
  };
  workflow: {
    title: string;
    description: string;
    steps: WorkflowStep[];
  };
  trust?: TrustSection;
}

interface DomainHubProps {
  config: DomainHubConfig;
}

export function DomainHub({ config }: DomainHubProps) {
  // Determine domain type from config
  const getDomainType = (): DomainType => {
    const badge = config.hero.badge.toLowerCase();
    if (badge.includes('business') || badge.includes('enterprise')) return 'business';
    if (badge.includes('health')) return 'health';
    if (badge.includes('education') || badge.includes('learning')) return 'education';
    if (badge.includes('sustainability') || badge.includes('climate')) return 'sustainability';
    return 'business'; // default fallback
  };

  const domain = getDomainType();

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24">

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center space-y-8 pt-8 md:pt-16"
        >
          <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
            {config.hero.badge}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-foreground max-w-5xl">
            {config.hero.title} <span className="font-serif italic text-muted-foreground">{config.hero.titleItalic}</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
            {config.hero.description}
          </p>

          <div className="flex gap-4 pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href={config.hero.primaryCta.link}>
                {config.hero.primaryCta.text} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {config.hero.secondaryCta && (
              <Button variant="ghost" size="lg" className="rounded-full text-base px-8 h-12" asChild>
                <Link href={config.hero.secondaryCta.link}>
                  {config.hero.secondaryCta.text}
                </Link>
              </Button>
            )}
          </div>
        </motion.section>

        {/* Pathways Grid */}
        <motion.section
          id="pathways"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <div className="flex items-center gap-3 border-b pb-4">
            {(() => {
              const SectionIcon = getIcon(config.pathways.sectionIcon);
              return SectionIcon ? <SectionIcon className="h-5 w-5 text-muted-foreground" /> : null;
            })()}
            <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">
              {config.pathways.sectionTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.pathways.items.map((path, i) => (
              <motion.div key={i} variants={item}>
                <Card className="group hover:shadow-md transition-all duration-300 border-muted-foreground/10 bg-card/50 hover:bg-card h-full flex flex-col">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${path.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {(() => {
                        const PathIcon = getIcon(path.icon);
                        return PathIcon ? <PathIcon className={`h-6 w-6 ${path.color}`} /> : null;
                      })()}
                    </div>
                    <CardTitle className="text-2xl font-light">{path.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between gap-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {path.description}
                    </p>
                    <div className="pt-2">
                      <Link href={path.link} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-300">
                        {path.action} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Workflow Section */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12 py-12 border-y border-dashed border-muted-foreground/20"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-light tracking-tight">{config.workflow.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {config.workflow.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

            {config.workflow.steps.map((step, i) => (
              <motion.div key={i} variants={item} className="relative z-10 flex flex-col items-center text-center space-y-4 bg-background p-4">
                <div className="w-24 h-24 rounded-full bg-muted/30 border border-border flex items-center justify-center mb-2">
                  {(() => {
                    const StepIcon = getIcon(step.icon);
                    return StepIcon ? <StepIcon className="h-8 w-8 text-foreground/70" /> : null;
                  })()}
                </div>
                <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Step {step.step}</span>
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trust/Standards Section (Optional) */}
        {config.trust && (() => {
          const trust = config.trust;
          const BadgeIcon = getIcon(trust.badgeIcon);
          const FeatureIcon = getIcon(trust.featureIcon);
          return (
            <motion.section
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary/5 rounded-3xl p-8 md:p-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  {BadgeIcon ? <BadgeIcon className="h-6 w-6" /> : null}
                  <span className="font-semibold tracking-tight">{trust.badge}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light leading-tight">
                  {trust.title} <br />
                  <span className="font-serif italic text-muted-foreground">{trust.titleItalic}</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {trust.description}
                </p>
                <ul className="space-y-3 pt-4">
                  {trust.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      {FeatureIcon ? <FeatureIcon className="h-4 w-4 text-primary/60" /> : null}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {trust.demo && (
                <div className="relative h-full min-h-[300px] bg-background rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col justify-center space-y-6">
                  <div className="space-y-4">
                    {trust.demo.messages.map((msg, i) => (
                      <div key={i} className={`flex items-start gap-3 ${msg.type === 'ai' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          msg.type === 'user'
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {msg.type === 'user' ? 'Q' : 'AI'}
                        </div>
                        <div className={`p-3 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-muted/30 rounded-tl-none'
                            : 'bg-primary/5 rounded-tr-none space-y-2'
                        }`}>
                          <p>{msg.content}</p>
                          {msg.subtext && (
                            <p className="text-xs text-muted-foreground italic">{msg.subtext}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {trust.demo.insight && (
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-xs text-indigo-600/80 leading-relaxed flex gap-3 items-start mt-4">
                      {(() => {
                        const InsightIcon = getIcon(trust.demo!.insight!.icon);
                        return InsightIcon ? <InsightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" /> : null;
                      })()}
                      <span>
                        <strong>{trust.demo.insight.strong}:</strong> {trust.demo.insight.text}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          );
        })()}

        {/* Three.js Animation - Bottom of Page */}
        <DomainHeroAnimation domain={domain} className="mb-8" />

      </div>
    </div>
  );
}
