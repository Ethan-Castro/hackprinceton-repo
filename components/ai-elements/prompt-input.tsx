'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square } from 'lucide-react';

export interface PromptInputMessage {
  text?: string;
  files?: File[];
}

export interface PromptInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (message: PromptInputMessage) => void;
}

const PromptInputContext = React.createContext<{
  onSubmit?: (message: PromptInputMessage) => void;
} | null>(null);

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, children, onSubmit, ...props }, ref) => {
    return (
      <PromptInputContext.Provider value={{ onSubmit }}>
        <div
          ref={ref}
          className={cn('relative', className)}
          {...props}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    );
  }
);
PromptInput.displayName = 'PromptInput';

export interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn('resize-none', className)}
      {...props}
    />
  );
});
PromptInputTextarea.displayName = 'PromptInputTextarea';

export interface PromptInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: 'ready' | 'streaming';
}

export const PromptInputSubmit = React.forwardRef<
  HTMLButtonElement,
  PromptInputSubmitProps
>(({ className, status = 'ready', disabled, ...props }, ref) => {
  const context = React.useContext(PromptInputContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
    if (context?.onSubmit && status === 'ready') {
      // Get the textarea value from the parent form
      const form = e.currentTarget.closest('div');
      const textarea = form?.querySelector('textarea');
      if (textarea) {
        context.onSubmit({ text: textarea.value });
      }
    }
  };

  return (
    <Button
      ref={ref}
      size="icon"
      variant="default"
      disabled={disabled || status === 'streaming'}
      onClick={handleClick}
      className={cn('h-8 w-8', className)}
      {...props}
    >
      {status === 'streaming' ? (
        <Square className="h-4 w-4" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  );
});
PromptInputSubmit.displayName = 'PromptInputSubmit';
