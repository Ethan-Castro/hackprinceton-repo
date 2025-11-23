"use client";

import { motion } from "framer-motion";
import { 
  GraduationCap, 
  BookOpen, 
  Lightbulb, 
  BrainCircuit, 
  Library, 
  Sparkles, 
  ArrowRight, 
  Puzzle,
  Users,
  PenTool,
  MonitorPlay
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

const pathways = [
  {
    title: "Adaptive Learning",
    description: "Personalized curriculums that evolve in real-time based on student performance and engagement.",
    icon: BrainCircuit,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    link: "/education/courses",
    action: "Explore Courses"
  },
  {
    title: "Interactive Assessment",
    description: "Dynamic quizzes and problem sets that test deep understanding rather than rote memorization.",
    icon: Puzzle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    link: "/education/quizzes",
    action: "Take Quiz"
  },
  {
    title: "Content Studio",
    description: "Tools for educators to generate lesson plans, visual aids, and interactive materials instantly.",
    icon: PenTool,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    link: "/education/studio",
    action: "Open Studio"
  },
  {
    title: "Research Assistant",
    description: "A specialized companion for navigating academic papers, citations, and complex topics.",
    icon: Library,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    link: "/education/study",
    action: "Start Research"
  }
];

const methodology = [
  {
    step: "01",
    title: "Assess",
    desc: "Evaluate current knowledge gaps and learning style preferences.",
    icon: Users
  },
  {
    step: "02",
    title: "Adapt",
    desc: "Tailor content delivery speed and complexity to the learner.",
    icon: Sparkles
  },
  {
    step: "03",
    title: "Advance",
    desc: "Reinforce mastery through spaced repetition and practical application.",
    icon: GraduationCap
  }
];

export default function EducationHubPage() {
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
            Future of Learning
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-foreground max-w-5xl">
            Democratizing <span className="font-serif italic text-muted-foreground">Mastery</span> for Everyone.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
            An AI-powered educational ecosystem designed to unlock human potential. 
            Personalized, scalable, and deeply engaging.
          </p>

          <div className="flex gap-4 pt-4">
            <Button size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href="/education/studio">
                Launch Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full text-base px-8 h-12" asChild>
              <Link href="#learning-pathways">
                View Pathways
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Learning Pathways Grid */}
        <motion.section
          id="learning-pathways"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <div className="flex items-center gap-3 border-b pb-4">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Learning Pathways</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pathways.map((path, i) => (
              <motion.div key={i} variants={item}>
                <Card className="group hover:shadow-md transition-all duration-300 border-muted-foreground/10 bg-card/50 hover:bg-card h-full flex flex-col">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${path.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <path.icon className={`h-6 w-6 ${path.color}`} />
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

        {/* Methodology Workflow */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12 py-12 border-y border-dashed border-muted-foreground/20"
        >
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-light tracking-tight">The Learning Engine</h2>
             <p className="text-muted-foreground max-w-xl mx-auto">
               A pedagogical framework enhanced by machine intelligence.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
             {/* Connecting line for desktop */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

            {methodology.map((step, i) => (
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

        {/* Academic Integrity */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary/5 rounded-3xl p-8 md:p-12"
        >
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-primary">
               <Lightbulb className="h-6 w-6" />
               <span className="font-semibold tracking-tight">ACADEMIC STANDARD</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-light leading-tight">
               Fostering Genuine <br/>
               <span className="font-serif italic text-muted-foreground">Understanding.</span>
             </h2>
             <p className="text-lg text-muted-foreground leading-relaxed">
               Our tools are designed to scaffold learning, not bypass it. We prioritize the Socratic method, guiding students to answers rather than simply providing them.
             </p>
             <ul className="space-y-3 pt-4">
               {[
                 "Socratic Tutoring Models",
                 "Citation & Source Verification",
                 "Plagiarism Detection Integration",
                 "Curriculum Alignment Standards"
               ].map((feature, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm font-medium">
                   <MonitorPlay className="h-4 w-4 text-primary/60" />
                   {feature}
                 </li>
               ))}
             </ul>
          </div>
          <div className="relative h-full min-h-[300px] bg-background rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col justify-center space-y-6">
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">Q</div>
                    <div className="bg-muted/30 p-3 rounded-lg rounded-tl-none text-sm">
                        Explain the significance of the mitochondria.
                    </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">AI</div>
                    <div className="bg-primary/5 p-3 rounded-lg rounded-tr-none text-sm space-y-2">
                        <p>Think about how a city gets its power. What role does a power plant play?</p>
                        <p className="text-xs text-muted-foreground italic">Leading with an analogy...</p>
                    </div>
                </div>
             </div>
             
             <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-xs text-indigo-600/80 leading-relaxed flex gap-3 items-start mt-4">
               <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
               <span>
                 <strong>Guided Inquiry:</strong> The model encourages critical thinking by asking follow-up questions instead of giving direct answers.
               </span>
             </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
