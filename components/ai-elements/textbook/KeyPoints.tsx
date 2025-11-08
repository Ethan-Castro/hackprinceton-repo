'use client';

import * as React from 'react';
import { Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface KeyPoint {
  heading: string;
  description: string;
}

interface KeyPointsProps {
  title?: string;
  points: KeyPoint[];
  className?: string;
}

export const KeyPoints: React.FC<KeyPointsProps> = ({
  title = 'Key Points',
  points,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-card shadow-border-medium overflow-hidden transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Essential concepts to remember
        </p>
      </div>

      {/* Key Points List */}
      <div className="p-6">
        <div className="grid gap-4">
          {points.map((point, index) => (
            <div
              key={index}
              className="group flex gap-4 p-4 rounded-lg border bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-md transition-all duration-200"
            >
              {/* Number Badge */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1.5">
                <h4 className="font-semibold text-base leading-tight flex items-center gap-2">
                  {point.heading}
                  <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {point.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
