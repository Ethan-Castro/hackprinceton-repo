"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  Heart, 
  Shield, 
  Brain, 
  Database, 
  ArrowRight, 
  Stethoscope, 
  Microscope, 
  Lock,
  FileText,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

const areas = [
  {
    title: "Clinical Decision Support",
    description: "Augmenting diagnostic accuracy with pattern recognition and historical data analysis.",
    icon: Stethoscope,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    link: "/health/chat",
    action: "Try Diagnostic Aid"
  },
  {
    title: "Personalized Wellness",
    description: "Tailoring health plans based on individual biometrics, lifestyle, and genetic factors.",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    link: "/health/records",
    action: "View Records"
  },
  {
    title: "Medical Research",
    description: "Accelerating drug discovery and analyzing vast datasets to identify new treatments.",
    icon: Microscope,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    link: "/health/insights",
    action: "Explore Insights"
  },
  {
    title: "Operational Efficiency",
    description: "Streamlining hospital workflows, resource allocation, and patient triage systems.",
    icon: Database,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    link: "/health/chat?mode=admin",
    action: "Optimize Workflow"
  }
];

const workflow = [
  {
    step: "01",
    title: "Data Ingestion",
    desc: "Securely process multimodal inputs: labs, imaging, and notes.",
    icon: FileText
  },
  {
    step: "02",
    title: "Secure Analysis",
    desc: "AI models process data in a HIPAA-compliant environment.",
    icon: Brain
  },
  {
    step: "03",
    title: "Actionable Insights",
    desc: "Receive evidence-based recommendations for clinical review.",
    icon: Zap
  }
];

export default function HealthHubPage() {
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
            Health Intelligence Hub
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-foreground max-w-4xl">
            The Future of <span className="font-serif italic text-muted-foreground">Care</span> is Intelligent.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
            A comprehensive guide and toolkit for applying artificial intelligence in healthcare. 
            Enhancing human expertise with machine precision.
          </p>

          <div className="flex gap-4 pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href="/health/chat">
                Launch Health Assistant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href="#knowledge-hub">
                Explore The Hub
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Knowledge Hub Grid */}
        <motion.section
          id="knowledge-hub"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <div className="flex items-center gap-3 border-b pb-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Knowledge Areas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {areas.map((area, i) => (
              <motion.div key={i} variants={item}>
                <Card className="group hover:shadow-md transition-all duration-300 border-muted-foreground/10 bg-card/50 hover:bg-card h-full flex flex-col">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${area.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <area.icon className={`h-6 w-6 ${area.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-light">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between gap-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {area.description}
                    </p>
                    <div className="pt-2">
                       <Link href={area.link} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-300">
                          {area.action} <ArrowRight className="ml-1 h-3 w-3" />
                       </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12 py-12 border-y border-dashed border-muted-foreground/20"
        >
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-light tracking-tight">Human-AI Collaboration Workflow</h2>
             <p className="text-muted-foreground max-w-xl mx-auto">
               A transparent view of how data flows from patient records to actionable clinical insights.
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

        {/* Trust & Safety */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary/5 rounded-3xl p-8 md:p-12"
        >
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-primary">
               <Shield className="h-6 w-6" />
               <span className="font-semibold tracking-tight">TRUST & SAFETY</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-light leading-tight">
               Built for Privacy First. <br/>
               <span className="font-serif italic text-muted-foreground">Never compromised.</span>
             </h2>
             <p className="text-lg text-muted-foreground leading-relaxed">
               Our architecture ensures that patient data never leaves your secure environment without explicit authorization. 
               We utilize local inference where possible and enterprise-grade encryption for all transmissions.
             </p>
             <ul className="space-y-3 pt-4">
               {[
                 "HIPAA Compliant Infrastructure",
                 "Zero-Retention Data Policy",
                 "Human-in-the-Loop Verification",
                 "Role-Based Access Control"
               ].map((feature, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm font-medium">
                   <Lock className="h-4 w-4 text-primary/60" />
                   {feature}
                 </li>
               ))}
             </ul>
          </div>
          <div className="relative h-full min-h-[300px] bg-background rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col justify-center space-y-6">
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Encryption Standard</span>
                 <span className="font-mono">AES-256</span>
               </div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-full" />
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Compliance Check</span>
                 <span className="font-mono text-green-600">PASSED</span>
               </div>
               <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-full" />
               </div>
             </div>
             <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-600/80 leading-relaxed">
               <span className="font-semibold block mb-1">Advisory Note:</span>
               AI suggestions are for informational purposes only and should always be verified by a qualified healthcare professional.
             </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

