"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  TrendingUp, 
  PieChart, 
  Target, 
  Layers, 
  Users, 
  Globe, 
  ArrowRight, 
  Zap,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const pillars = [
  {
    title: "Market Analytics",
    description: "Real-time competitive intelligence and trend forecasting to stay ahead of market shifts.",
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    link: "/business/analytics",
    action: "Analyze Market"
  },
  {
    title: "Financial Modeling",
    description: "Predictive revenue models and risk assessment scenarios powered by historical data.",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    link: "/business-analyst",
    action: "Start Modeling"
  },
  {
    title: "Strategic Planning",
    description: "Optimize resource allocation and test strategic hypotheses in a risk-free simulation environment.",
    icon: Target,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    link: "/business/strategy",
    action: "Build Strategy"
  },
  {
    title: "Automated Reporting",
    description: "Generate comprehensive executive summaries and stakeholder presentations in seconds.",
    icon: PieChart,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    link: "/business/reports",
    action: "Generate Report"
  }
];

const workflow = [
  {
    step: "01",
    title: "Aggregate",
    desc: "Ingest data from internal KPIs, public markets, and competitor signals.",
    icon: Layers
  },
  {
    step: "02",
    title: "Synthesize",
    desc: "Detect hidden patterns and correlations using advanced inference.",
    icon: Zap
  },
  {
    step: "03",
    title: "Execute",
    desc: "Deliver actionable strategic recommendations to leadership.",
    icon: BarChart3
  }
];

export default function BusinessHubPage() {
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
            Enterprise Intelligence
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-foreground max-w-5xl">
            Operationalizing <span className="font-serif italic text-muted-foreground">Intelligence</span> for Market Leadership.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
            A unified command center for data-driven decision making. 
            Translate complex signals into clear strategic advantages.
          </p>

          <div className="flex gap-4 pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href="/business-analyst">
                Launch Business Suite <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href="#strategic-pillars">
                Explore Capabilities
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Strategic Pillars Grid */}
        <motion.section
          id="strategic-pillars"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <div className="flex items-center gap-3 border-b pb-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Strategic Pillars</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div key={i} variants={item}>
                <Card className="group hover:shadow-md transition-all duration-300 border-muted-foreground/10 bg-card/50 hover:bg-card h-full flex flex-col">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${pillar.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <pillar.icon className={`h-6 w-6 ${pillar.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-light">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between gap-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                    <div className="pt-2">
                       <Link href={pillar.link} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-300">
                          {pillar.action} <ArrowRight className="ml-1 h-3 w-3" />
                       </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Intelligence Engine Workflow */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12 py-12 border-y border-dashed border-muted-foreground/20"
        >
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-light tracking-tight">The Intelligence Engine</h2>
             <p className="text-muted-foreground max-w-xl mx-auto">
               From raw data to executive strategy in three automated steps.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
             {/* Connecting line for desktop */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

            {workflow.map((step, i) => (
              <motion.div key={i} variants={item} className="relative z-10 flex flex-col items-center text-center space-y-4 bg-background p-4">
                <div className="w-24 h-24 rounded-full bg-muted/30 border border-border flex items-center justify-center mb-2">
                  <step.icon className="h-8 w-8 text-foreground/70" />
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

        {/* Enterprise Security */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary/5 rounded-3xl p-8 md:p-12"
        >
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-primary">
               <ShieldCheck className="h-6 w-6" />
               <span className="font-semibold tracking-tight">ENTERPRISE GRADE</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-light leading-tight">
               Security at Scale. <br/>
               <span className="font-serif italic text-muted-foreground">Zero compromise.</span>
             </h2>
             <p className="text-lg text-muted-foreground leading-relaxed">
               Deployed on your private infrastructure or our secure cloud. We adhere to strict data sovereignty principles, ensuring your proprietary intelligence remains yours.
             </p>
             <ul className="space-y-3 pt-4">
               {[
                 "SOC2 Type II Certified",
                 "Role-Based Access Control (RBAC)",
                 "Audit Logs & Compliance Reporting",
                 "Single Sign-On (SSO) Integration"
               ].map((feature, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm font-medium">
                   <Users className="h-4 w-4 text-primary/60" />
                   {feature}
                 </li>
               ))}
             </ul>
          </div>
          <div className="relative h-full min-h-[300px] bg-background rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col justify-center space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center space-y-1">
                    <div className="text-2xl font-light">99.9%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Uptime SLA</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center space-y-1">
                    <div className="text-2xl font-light">&lt;50ms</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Latency</div>
                </div>
             </div>
             
             <div className="space-y-2 pt-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Encryption</span>
                 <span className="font-mono">End-to-End</span>
               </div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-full" />
               </div>
             </div>
             
             <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs text-emerald-600/80 leading-relaxed flex gap-3 items-start">
               <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
               <span>
                 <strong>Data Sovereignty:</strong> Your data is processed in isolation and never used to train shared models without explicit consent.
               </span>
             </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
