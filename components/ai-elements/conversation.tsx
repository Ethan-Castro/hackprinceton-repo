'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ConversationProps = React.HTMLAttributes<HTMLDivElement>;

export const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Conversation.displayName = 'Conversation';

export type ConversationContentProps = React.HTMLAttributes<HTMLDivElement>;

export const ConversationContent = React.forwardRef<
  HTMLDivElement,
  ConversationContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});
ConversationContent.displayName = 'ConversationContent';
