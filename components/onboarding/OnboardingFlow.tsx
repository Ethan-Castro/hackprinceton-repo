'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Briefcase, Heart, GraduationCap, Zap, Brain, Gauge, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = 'category' | 'preferences' | 'complete';

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('health');
  const [selectedModel, setSelectedModel] = useState<string>('auto');

  const steps: OnboardingStep[] = ['category', 'preferences', 'complete'];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (step === 'category') setStep('preferences');
    else if (step === 'preferences') setStep('complete');
    else handleComplete();
  };

  const handleBack = () => {
    if (step === 'preferences') setStep('category');
    else if (step === 'complete') setStep('preferences');
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('preferred_category', selectedCategory);
    localStorage.setItem('preferred_model', selectedModel);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl">
        <div className="flex h-[600px]">
           {/* Sidebar Steps */}
           <div className="w-1/3 bg-muted/30 border-r border-border/40 p-8 hidden md:flex flex-col">
              <div className="mb-8">
                 <h2 className="text-lg font-medium tracking-tight">Setup Guide</h2>
                 <p className="text-sm text-muted-foreground mt-1">Configure your workspace</p>
              </div>
              
              <div className="space-y-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border/50" />

                  {steps.map((s, i) => (
                    <div key={s} className="relative flex items-center gap-3 z-10">
                      <div className={cn(
                        "w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium transition-colors duration-300",
                        steps.indexOf(step) > i ? "bg-primary text-primary-foreground border-primary" :
                        steps.indexOf(step) === i ? "bg-background border-primary text-primary ring-2 ring-primary/20" :
                        "bg-background border-border text-muted-foreground"
                      )}>
                        {steps.indexOf(step) > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        steps.indexOf(step) === i ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {s === 'category' && 'Focus Area'}
                        {s === 'preferences' && 'Intelligence'}
                        {s === 'complete' && 'Confirmation'}
                      </span>
                    </div>
                  ))}
              </div>
           </div>

           {/* Main Content */}
           <div className="flex-1 flex flex-col p-8 md:p-10">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {step === 'category' && (
                    <motion.div
                      key="category"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-2xl font-light tracking-tight mb-2">Choose Your Focus</h2>
                        <p className="text-muted-foreground">Select the primary domain for your initial workflow. You can switch this later.</p>
                      </div>

                      <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="grid gap-4">
                        <div className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedCategory === 'health' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card hover:bg-muted/50"
                        )} onClick={() => setSelectedCategory('health')}>
                          <div className="mt-1 p-2 rounded-lg bg-red-500/10 text-red-500">
                            <Heart className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <Label className="text-base font-medium cursor-pointer">Health Studio</Label>
                                <RadioGroupItem value="health" id="health" className="sr-only" />
                                {selectedCategory === 'health' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                             <p className="text-sm text-muted-foreground mt-1">Clinical support, patient tracking, and wellness analytics.</p>
                          </div>
                        </div>

                        <div className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedCategory === 'business' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card hover:bg-muted/50"
                        )} onClick={() => setSelectedCategory('business')}>
                          <div className="mt-1 p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <Label className="text-base font-medium cursor-pointer">Business OS</Label>
                                <RadioGroupItem value="business" id="business" className="sr-only" />
                                {selectedCategory === 'business' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                             <p className="text-sm text-muted-foreground mt-1">Market intelligence, strategy generation, and financial modeling.</p>
                          </div>
                        </div>

                         <div className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedCategory === 'education' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card hover:bg-muted/50"
                        )} onClick={() => setSelectedCategory('education')}>
                          <div className="mt-1 p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <Label className="text-base font-medium cursor-pointer">Education Lab</Label>
                                <RadioGroupItem value="education" id="education" className="sr-only" />
                                {selectedCategory === 'education' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                             <p className="text-sm text-muted-foreground mt-1">Curriculum design, tutoring systems, and learning pathways.</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </motion.div>
                  )}

                  {step === 'preferences' && (
                     <motion.div
                      key="preferences"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-2xl font-light tracking-tight mb-2">Intelligence Level</h2>
                        <p className="text-muted-foreground">Configure how the AI reasoning engine should behave by default.</p>
                      </div>

                      <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="grid gap-4">
                         <div className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedModel === 'auto' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card hover:bg-muted/50"
                        )} onClick={() => setSelectedModel('auto')}>
                          <div className="mt-1 p-2 rounded-lg bg-amber-500/10 text-amber-500">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <Label className="text-base font-medium cursor-pointer">Adaptive (Recommended)</Label>
                                <RadioGroupItem value="auto" id="auto" className="sr-only" />
                                {selectedModel === 'auto' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                             <p className="text-sm text-muted-foreground mt-1">Automatically balances speed and depth based on query complexity.</p>
                          </div>
                        </div>

                        <div className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedModel === 'fast' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card hover:bg-muted/50"
                        )} onClick={() => setSelectedModel('fast')}>
                          <div className="mt-1 p-2 rounded-lg bg-green-500/10 text-green-500">
                            <Gauge className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <Label className="text-base font-medium cursor-pointer">Low Latency</Label>
                                <RadioGroupItem value="fast" id="fast" className="sr-only" />
                                {selectedModel === 'fast' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                             <p className="text-sm text-muted-foreground mt-1">Optimized for real-time interactions and quick tasks.</p>
                          </div>
                        </div>

                         <div className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedModel === 'advanced' ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card hover:bg-muted/50"
                        )} onClick={() => setSelectedModel('advanced')}>
                          <div className="mt-1 p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <Label className="text-base font-medium cursor-pointer">Deep Reasoning</Label>
                                <RadioGroupItem value="advanced" id="advanced" className="sr-only" />
                                {selectedModel === 'advanced' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                             <p className="text-sm text-muted-foreground mt-1">Maximum capability for complex analysis and problem solving.</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </motion.div>
                  )}

                  {step === 'complete' && (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center h-full text-center space-y-6"
                    >
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
                         <CheckCircle2 className="w-12 h-12 text-primary" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-3xl font-light tracking-tight">Configuration Complete</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Your workspace has been initialized with the <span className="font-medium text-foreground capitalize">{selectedCategory}</span> context and <span className="font-medium text-foreground capitalize">{selectedModel}</span> intelligence profile.
                        </p>
                      </div>

                      <div className="w-full max-w-sm bg-muted/30 rounded-xl p-4 text-left space-y-3 border border-border/50">
                         <div className="flex items-center gap-3 text-sm">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           <span>Knowledge base connected</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           <span>Reasoning engine primed</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           <span>Context window initialized</span>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-auto">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={stepIndex === 0}
                  className={cn("text-muted-foreground", stepIndex === 0 && "opacity-0 pointer-events-none")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                
                <Button 
                  onClick={handleNext} 
                  size="lg" 
                  className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {step === 'complete' ? 'Launch Workspace' : 'Continue'}
                  {step !== 'complete' && <ChevronRight className="w-4 h-4 ml-1" />}
                  {step === 'complete' && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
