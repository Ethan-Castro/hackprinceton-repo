'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Paperclip, X } from 'lucide-react';
import type { UIMessage, FileUIPart } from 'ai';

// Context for message branching
const MessageBranchContext = React.createContext<{
  currentBranch: number;
  totalBranches: number;
  onBranchChange: (index: number) => void;
}>({
  currentBranch: 0,
  totalBranches: 0,
  onBranchChange: () => {},
});

// Main Message component
export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: UIMessage['role'];
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ from, className, children, ...props }, ref) => {
    const isUser = from === 'user';
    
    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex w-full',
          isUser ? 'justify-end' : 'justify-start',
          className
        )}
        {...props}
      >
        {!isUser && (
          <Avatar className="h-8 w-8 mt-1 mr-3 shrink-0">
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            'flex-1 max-w-3xl',
            isUser && 'flex flex-col items-end'
          )}
        >
          {children}
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 mt-1 ml-3 shrink-0">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }
);
Message.displayName = 'Message';

// MessageContent component
export type MessageContentProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  MessageContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('space-y-3', className)}
      {...props}
    >
      {children}
    </div>
  );
});
MessageContent.displayName = 'MessageContent';

// MessageActions component
export interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MessageActions.displayName = 'MessageActions';

// MessageAction component (individual action button)
export interface MessageActionProps extends React.ComponentProps<typeof Button> {
  tooltip?: string;
  label: string;
}

export const MessageAction = React.forwardRef<HTMLButtonElement, MessageActionProps>(
  ({ tooltip, label, className, children, ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', className)}
        aria-label={label}
        {...props}
      >
        {children}
      </Button>
    );

    if (tooltip || label) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltip || label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);
MessageAction.displayName = 'MessageAction';

// MessageBranch component
export interface MessageBranchProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
}

export const MessageBranch = React.forwardRef<HTMLDivElement, MessageBranchProps>(
  ({ defaultBranch = 0, onBranchChange, className, children, ...props }, ref) => {
    const [currentBranch, setCurrentBranch] = React.useState(defaultBranch);
    const childArray = React.Children.toArray(children);
    const totalBranches = childArray.length;

    const handleBranchChange = React.useCallback(
      (index: number) => {
        setCurrentBranch(index);
        onBranchChange?.(index);
      },
      [onBranchChange]
    );

    return (
      <MessageBranchContext.Provider
        value={{ currentBranch, totalBranches, onBranchChange: handleBranchChange }}
      >
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </MessageBranchContext.Provider>
    );
  }
);
MessageBranch.displayName = 'MessageBranch';

// MessageBranchContent component
export const MessageBranchContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { currentBranch } = React.useContext(MessageBranchContext);
  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref} className={className} {...props}>
      {childArray[currentBranch]}
    </div>
  );
});
MessageBranchContent.displayName = 'MessageBranchContent';

// MessageBranchSelector component
export interface MessageBranchSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  from: UIMessage['role'];
}

export const MessageBranchSelector = React.forwardRef<
  HTMLDivElement,
  MessageBranchSelectorProps
>(({ from, className, ...props }, ref) => {
  const { currentBranch, totalBranches, onBranchChange } = React.useContext(
    MessageBranchContext
  );

  if (totalBranches <= 1) {
    return null;
  }

  const isUser = from === 'user';

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-1',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      {...props}
    >
      <MessageBranchPrevious />
      <MessageBranchPage />
      <MessageBranchNext />
    </div>
  );
});
MessageBranchSelector.displayName = 'MessageBranchSelector';

// MessageBranchPrevious component
export const MessageBranchPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { currentBranch, onBranchChange } = React.useContext(MessageBranchContext);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('h-6 w-6', className)}
      disabled={currentBranch === 0}
      onClick={() => onBranchChange(currentBranch - 1)}
      aria-label="Previous branch"
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
});
MessageBranchPrevious.displayName = 'MessageBranchPrevious';

// MessageBranchNext component
export const MessageBranchNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { currentBranch, totalBranches, onBranchChange } = React.useContext(
    MessageBranchContext
  );

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('h-6 w-6', className)}
      disabled={currentBranch >= totalBranches - 1}
      onClick={() => onBranchChange(currentBranch + 1)}
      aria-label="Next branch"
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
});
MessageBranchNext.displayName = 'MessageBranchNext';

// MessageBranchPage component
export const MessageBranchPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { currentBranch, totalBranches } = React.useContext(MessageBranchContext);

  return (
    <span
      ref={ref}
      className={cn('text-xs text-muted-foreground px-2', className)}
      {...props}
    >
      {currentBranch + 1} / {totalBranches}
    </span>
  );
});
MessageBranchPage.displayName = 'MessageBranchPage';

// MessageAttachments component
export interface MessageAttachmentsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageAttachments = React.forwardRef<HTMLDivElement, MessageAttachmentsProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) {
      return null;
    }

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
MessageAttachments.displayName = 'MessageAttachments';

// MessageAttachment component
export interface MessageAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  data: FileUIPart;
  onRemove?: () => void;
}

export const MessageAttachment = React.forwardRef<HTMLDivElement, MessageAttachmentProps>(
  ({ data, onRemove, className, ...props }, ref) => {
    const isImage = data.mediaType?.startsWith('image/');

    if (isImage) {
      return (
        <div
          ref={ref}
          className={cn('relative group', className)}
          {...props}
        >
          <img
            src={data.url}
            alt={data.filename || 'Attachment'}
            className="h-24 w-24 object-cover rounded-md border"
          />
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative group flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50',
          className
        )}
        {...props}
      >
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs truncate max-w-[200px]">
          {data.filename || 'Attachment'}
        </span>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }
);
MessageAttachment.displayName = 'MessageAttachment';

// Re-export MessageResponse from response.tsx
export { Response as MessageResponse } from './response';
