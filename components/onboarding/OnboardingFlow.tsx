'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <Dialog open={open} onOpenChange={onComplete}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <DialogHeader>
              <DialogTitle>Set Up Your Preferences</DialogTitle>
              <DialogDescription>
                {step === 'category' && 'Choose your primary focus area'}
                {step === 'preferences' && 'Select your preferences'}
                {step === 'complete' && "You're all set!"}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Step {stepIndex + 1} of {steps.length}
            </p>
          </div>

          {/* Content */}
          <div className="min-h-[200px]">
            {step === 'category' && (
              <div className="space-y-4">
                <p className="text-sm font-medium">Choose your primary focus:</p>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="health" id="health" />
                    <Label htmlFor="health" className="cursor-pointer flex-1">
                      <p className="font-medium">🏥 Health Coach</p>
                      <p className="text-sm text-muted-foreground">
                        Medical guidance, fitness plans, health tracking
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business" className="cursor-pointer flex-1">
                      <p className="font-medium">💼 Business Assistant</p>
                      <p className="text-sm text-muted-foreground">
                        Business plans, market analysis, strategy
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="education" id="education" />
                    <Label htmlFor="education" className="cursor-pointer flex-1">
                      <p className="font-medium">📚 Education Studio</p>
                      <p className="text-sm text-muted-foreground">
                        Courses, learning materials, quizzes
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 'preferences' && (
              <div className="space-y-4">
                <p className="text-sm font-medium">Select your preferences:</p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Model Selection</Label>
                    <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                      <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto" className="cursor-pointer flex-1">
                          <p className="font-medium text-sm">Auto (Recommended)</p>
                          <p className="text-xs text-muted-foreground">
                            We'll choose the best model for each task
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="fast" id="fast" />
                        <Label htmlFor="fast" className="cursor-pointer flex-1">
                          <p className="font-medium text-sm">Fast</p>
                          <p className="text-xs text-muted-foreground">
                            Quicker responses, good for most tasks
                          </p>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="advanced" id="advanced" />
                        <Label htmlFor="advanced" className="cursor-pointer flex-1">
                          <p className="font-medium text-sm">Advanced</p>
                          <p className="text-xs text-muted-foreground">
                            Most capable, longer responses
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center space-y-4">
                <div className="text-5xl">✨</div>
                <div>
                  <h3 className="font-semibold mb-2">All Set!</h3>
                  <p className="text-sm text-muted-foreground">
                    You're ready to explore. You can start by:
                  </p>
                </div>
                <ul className="text-sm text-left space-y-2 bg-muted p-3 rounded">
                  <li>• Asking a question in your chosen category</li>
                  <li>• Starting from a template</li>
                  <li>• Exploring other features</li>
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {step === 'complete' ? 'Get Started' : 'Next'}
              {step !== 'complete' && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
