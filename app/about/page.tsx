"use client";

import { motion } from "framer-motion";
import { Users, Target, Globe, Award, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const values = [
  {
    title: "Innovation First",
    icon: Zap,
    description: "Pushing the boundaries of what's possible with AI and human collaboration."
  },
  {
    title: "Global Impact",
    icon: Globe,
    description: "Creating solutions that scale across borders and industries."
  },
  {
    title: "User Centric",
    icon: Users,
    description: "Designing with the end-user in mind to create seamless experiences."
  }
];

const teamPlaceholders = [1, 2, 3, 4];

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
            About <span className="font-serif italic text-muted-foreground">Augment</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl font-light leading-relaxed text-balance">
            Building the bridge between human intent and artificial intelligence. We are redefining how the world interacts with technology.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Main Content Column */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Our Story</h2>
            </div>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg font-light">
              <motion.p variants={item}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </motion.p>
              <motion.p variants={item}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </motion.p>
              <motion.p variants={item}>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </motion.p>
            </div>

            {/* Team Section Placeholder */}
            <div className="mt-12 pt-8 border-t">
               <div className="flex items-center gap-2 border-b pb-4 mb-6">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">The Team</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {teamPlaceholders.map((_, i) => (
                  <motion.div key={i} variants={item}>
                     <div className="aspect-square rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50" />
                          <div className="h-3 w-20 mx-auto bg-muted/50 rounded" />
                        </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar Column (Values) */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="lg:col-span-5 space-y-6 sm:space-y-8"
            >
             <div className="flex items-center gap-2 border-b pb-4 mb-6">
              <Award className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-wide uppercase text-muted-foreground">Our Values</h2>
            </div>

            <div className="space-y-4">
              {values.map((value, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="hover:shadow-md transition-shadow duration-300 border-none bg-muted/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <value.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-serif">{value.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact / Location Placeholder */}
            <motion.div 
              variants={item}
              className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden"
            >
              <h3 className="text-lg font-medium mb-4">Get in Touch</h3>
              <div className="space-y-4 font-mono text-xs sm:text-sm text-muted-foreground">
                <p>123 Innovation Drive<br/>San Francisco, CA 94105</p>
                <p>hello@augment.ai</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

