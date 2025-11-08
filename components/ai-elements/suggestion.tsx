'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type SuggestionsProps = React.HTMLAttributes<HTMLDivElement>;

export const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2 mb-2', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Suggestions.displayName = 'Suggestions';

export interface SuggestionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  suggestion: string;
}

export const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ suggestion, className, onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn('text-sm', className)}
        onClick={onClick}
        {...props}
      >
        {suggestion}
      </Button>
    );
  }
);
Suggestion.displayName = 'Suggestion';
