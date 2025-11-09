'use client';

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeDialogProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function WelcomeDialog({ open, onStart, onSkip }: WelcomeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onSkip();
      }}
    >
      <DialogContent
        className="max-w-2xl"
        onEscapeKeyDown={onSkip}
        onPointerDownOutside={onSkip}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Welcome to Augment
          </DialogTitle>
          <DialogDescription>
            Your personal AI-powered assistant for health, business, education, and more
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">1</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Multi-Domain Assistants</p>
                  <p className="text-xs text-muted-foreground">Health, Business, Education, and Sustainability all in one place</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">2</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Smart Templates</p>
                  <p className="text-xs text-muted-foreground">Get started quickly with pre-built, AI-powered templates</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">3</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Export Anywhere</p>
                  <p className="text-xs text-muted-foreground">PDF, Excel, PowerPoint - your content, your format</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-muted/30 border border-muted rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Get Started in Seconds</p>
            <p className="text-sm text-muted-foreground">Take a quick tour to discover all the features or dive right in</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onSkip}>
            Skip for Now
          </Button>
          <Button onClick={onStart} className="gap-2">
            Start Tour
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
