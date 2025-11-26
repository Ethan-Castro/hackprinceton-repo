'use client';

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Layers, Activity, Check, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeDialogProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
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
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export function WelcomeDialog({ open, onStart, onSkip }: WelcomeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onSkip();
      }}
    >
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl"
        onEscapeKeyDown={onSkip}
        onPointerDownOutside={onSkip}
      >
        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
          
          {/* Left Side: Visual / Branding */}
          <div className="w-full md:w-2/5 bg-muted/30 p-8 flex flex-col justify-between relative overflow-hidden border-r border-border/40">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
            <div className="absolute top-[-20%] right-[50%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
            
            <div className="relative z-10 space-y-6">
               <Badge variant="outline" className="px-3 py-1 text-xs tracking-widest uppercase rounded-full border-primary/20 text-primary/80 bg-background/50 backdrop-blur-sm">
                  System Online
                </Badge>
                <div className="space-y-2">
                   <h1 className="text-3xl font-light tracking-tighter text-foreground">
                    Augment <span className="font-serif italic text-muted-foreground">Intelligence</span>
                  </h1>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                     Your unified workspace for frictionless, high-performance AI collaboration.
                  </p>
                </div>
            </div>

            <div className="relative z-10 mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Real-time Intelligence</span>
                </div>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="font-medium">Multi-Modal Reasoning</span>
                </div>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="font-medium">Global Context Awareness</span>
                </div>
            </div>
          </div>

          {/* Right Side: Content & Actions */}
          <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-medium tracking-tight">Initialize Workspace</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Let's configure your AI environment for optimal performance.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1">
               <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-default group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                         <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-primary">01</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Select Focus Area</h3>
                        <p className="text-xs text-muted-foreground mt-1">Define your primary domain: Business, Health, or Education.</p>
                      </div>
                    </div>
                  </div>

                   <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-default group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                         <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-primary">02</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Configure Model Preferences</h3>
                        <p className="text-xs text-muted-foreground mt-1">Choose between speed (Instant) or depth (Reasoning).</p>
                      </div>
                    </div>
                  </div>

                   <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-default group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                         <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-primary">03</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Activate Tools</h3>
                        <p className="text-xs text-muted-foreground mt-1">Connect data sources and enable specialized capabilities.</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button variant="ghost" onClick={onSkip} className="text-muted-foreground hover:text-foreground">
                Skip Setup
              </Button>
              <Button onClick={onStart} size="lg" className="rounded-full px-6 group">
                Begin Configuration
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
