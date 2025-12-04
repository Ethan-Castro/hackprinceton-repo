"use client";

import { motion } from "framer-motion";
import { Users, Target, Zap, Rocket, Lightbulb, Linkedin, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

const ideas = [
  {
    title: "For Builders",
    icon: Rocket,
    description: "Replit, Vercel v0, and Lovable should consider using Cerebras and Groq for MVPs. Waiting 2-3 minutes for an agent that might fail is a bottleneck."
  },
  {
    title: "Cost Efficiency",
    icon: Zap,
    description: "Models like Kimi, GLM, or Qwen are ~1/3 the price of frontier models. Use them for speed, with Sonnet/Opus as the orchestrator."
  },
  {
    title: "Fast Design Mode",
    icon: Lightbulb,
    description: "Imagine code editors creating 3 previews of a site within seconds. A visual 'choose your own adventure' for design iteration."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start justify-center space-y-5 sm:space-y-6 pt-8 sm:pt-12 md:pt-24 pb-8 sm:pb-12"
        >
          <Badge variant="outline" className="px-4 py-1 text-sm tracking-widest uppercase rounded-full border-primary/20 text-primary/80">
            Our Mission
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-light tracking-tighter text-foreground">
            About <span className="font-serif italic text-muted-foreground">Augmenting.work</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl font-light leading-relaxed text-balance">
            Demonstrating the value of faster inference. If we are to augment with AI and save time, let's not create a new type of downtime waiting for responses.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Main Content Column */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-8"
          >
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">The Thesis</h2>
            </div>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg font-light">
              <motion.p variants={item}>
                Frontier models have pretty fast inference, though not fast enough for test-time compute/reasoning and 10+ tool calls.
              </motion.p>
              <motion.p variants={item}>
                We used <strong>Cerebras</strong> as our inference provider to create websites, analysis, and textbook chapters within <strong>2 seconds</strong>. We typically hit around <strong>2000 tokens/s</strong>.
              </motion.p>
              <motion.p variants={item}>
                <strong>The Details:</strong> We are using Cerebras and Groq as inference providers with models like GLM 4.6, GPT-OSS-120B, and Qwen.
              </motion.p>
              <motion.p variants={item} className="text-base italic border-l-2 border-primary/20 pl-4">
                "I just wanted to start posting updates for posterity because Groq and IBM partnered after I started this and I don't want to miss anymore news regarding the benefit of fast inference when it comes to tool-calling, Reasoning, Enterprise, and healthcare need for speed."
              </motion.p>
            </div>

            {/* Team Section */}
            <div className="mt-12 pt-8 border-t">
               <div className="flex items-center gap-2 border-b pb-4 mb-6">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">The Builder</h2>
              </div>
              <motion.div variants={item} className="flex items-start gap-6">
                 <div className="h-24 w-24 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center justify-center shrink-0">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-medium">Ethan Castro</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Working on this small project to demonstrate the true potential of real-time AI inference.
                    </p>
                    <Link 
                      href="https://www.linkedin.com/in/ethan-castro-926537165/" 
                      target="_blank" 
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      Connect on LinkedIn
                    </Link>
                 </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Sidebar Column (Values/Ideas) */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="lg:col-span-5 space-y-6 sm:space-y-8"
            >
             <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Fast Inference Ideas</h2>
            </div>

            <div className="space-y-4">
              {ideas.map((idea, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="hover:shadow-md transition-shadow duration-300 border-none bg-muted/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <idea.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-serif">{idea.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {idea.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Acknowledgements */}
            <motion.div 
              variants={item}
              className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden"
            >
              <h3 className="text-lg font-medium mb-4">Acknowledgements</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Special thanks to the innovators pushing the boundaries of inference speed.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-primary/70">
                <Badge variant="secondary">@GroqInc</Badge>
                <Badge variant="secondary">@Cerebras</Badge>
                <Badge variant="secondary">@IBM</Badge>
                <Badge variant="secondary">@Replit</Badge>
                <Badge variant="secondary">@Vercel</Badge>
              </div>
            </motion.div>

            <motion.div variants={item} className="pt-4">
              <Link 
                href="https://augmenting.work" 
                target="_blank"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Visit augmenting.work
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
