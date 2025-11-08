'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type LoaderProps = React.HTMLAttributes<HTMLDivElement>;

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
      </div>
    );
  }
);
Loader.displayName = 'Loader';
