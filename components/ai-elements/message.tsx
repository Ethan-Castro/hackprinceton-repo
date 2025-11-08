'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: 'user' | 'assistant';
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ from, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex gap-3 mb-4', className)}
        {...props}
      >
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback>
            {from === 'user' ? 'U' : 'AI'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          {children}
        </div>
      </div>
    );
  }
);
Message.displayName = 'Message';

export type MessageContentProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  MessageContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
});
MessageContent.displayName = 'MessageContent';
