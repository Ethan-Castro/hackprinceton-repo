'use client';

import * as React from 'react';
import { Network, Maximize2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DiagramType = 'flowchart' | 'concept-map' | 'timeline' | 'architecture' | 'process' | 'comparison' | 'other';

interface DiagramProps {
  title: string;
  description?: string;
  html: string;
  dataUrl: string;
  type: DiagramType;
  className?: string;
}

export const Diagram: React.FC<DiagramProps> = ({
  title,
  description,
  html,
  dataUrl,
  type,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeLabel = (type: DiagramType) => {
    const labels: Record<DiagramType, string> = {
      'flowchart': 'Flowchart',
      'concept-map': 'Concept Map',
      'timeline': 'Timeline',
      'architecture': 'Architecture',
      'process': 'Process Diagram',
      'comparison': 'Comparison',
      'other': 'Diagram',
    };
    return labels[type];
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-2xl border bg-card shadow-border-medium overflow-hidden transition-all duration-200',
          className
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Network className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFullscreen(true)}
                      className="h-8 w-8 hover:scale-105 transition-transform duration-150"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Fullscreen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDownload}
                      className="h-8 w-8 hover:scale-105 transition-transform duration-150"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Type Badge */}
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300">
              {getTypeLabel(type)}
            </span>
          </div>
        </div>

        {/* Diagram Content */}
        <div className="p-6 bg-muted/20">
          <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-950">
            <iframe
              src={dataUrl}
              className="w-full h-96 border-0"
              title={title}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative w-full max-w-6xl h-full max-h-[90vh] bg-background rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fullscreen Header */}
            <div className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-semibold">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsFullscreen(false)}
                className="h-8 px-3"
              >
                Close
              </Button>
            </div>

            {/* Fullscreen Content */}
            <div className="w-full h-full pt-20">
              <iframe
                src={dataUrl}
                className="w-full h-full border-0"
                title={title}
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
