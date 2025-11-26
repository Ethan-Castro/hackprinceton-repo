'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface WebPreviewContextValue {
  url: string;
  setUrl: (url: string) => void;
  history: string[];
  historyIndex: number;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const WebPreviewContext = React.createContext<
  WebPreviewContextValue | undefined
>(undefined);

function useWebPreview() {
  const context = React.useContext(WebPreviewContext);
  if (!context) {
    throw new Error('useWebPreview must be used within a WebPreview');
  }
  return context;
}

interface WebPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultUrl?: string;
  onUrlChange?: (url: string) => void;
}

const WebPreview = React.forwardRef<HTMLDivElement, WebPreviewProps>(
  ({ defaultUrl = '', onUrlChange, className, children, ...props }, ref) => {
    const [url, setUrlState] = React.useState(defaultUrl || '');
    const [history, setHistory] = React.useState<string[]>(defaultUrl ? [defaultUrl] : []);
    const [historyIndex, setHistoryIndex] = React.useState(0);
    const [refreshKey, setRefreshKey] = React.useState(0);

    const setUrl = React.useCallback(
      (newUrl: string) => {
        setUrlState(newUrl);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), newUrl]);
        setHistoryIndex((prev) => prev + 1);
        onUrlChange?.(newUrl);
      },
      [historyIndex, onUrlChange]
    );

    const goBack = React.useCallback(() => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setUrlState(history[newIndex]);
        onUrlChange?.(history[newIndex]);
      }
    }, [historyIndex, history, onUrlChange]);

    const goForward = React.useCallback(() => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setUrlState(history[newIndex]);
        onUrlChange?.(history[newIndex]);
      }
    }, [historyIndex, history, onUrlChange]);

    const refresh = React.useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []);

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;

    const contextValue: WebPreviewContextValue = {
      url,
      setUrl,
      history,
      historyIndex,
      goBack,
      goForward,
      refresh,
      canGoBack,
      canGoForward,
    };

    return (
      <WebPreviewContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'flex size-full flex-col bg-card',
            className
          )}
          {...props}
        >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === WebPreviewBody) {
            return React.cloneElement(child as React.ReactElement<WebPreviewBodyProps>, {
              key: refreshKey,
            });
          }
          return child;
        })}
        </div>
      </WebPreviewContext.Provider>
    );
  }
);
WebPreview.displayName = 'WebPreview';

const WebPreviewNavigation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-1 border-b p-2 h-14',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
WebPreviewNavigation.displayName = 'WebPreviewNavigation';

interface WebPreviewNavigationButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  tooltip?: string;
}

const WebPreviewNavigationButton = React.forwardRef<
  HTMLButtonElement,
  WebPreviewNavigationButtonProps
>(({ tooltip, className, children, ...props }, ref) => {
  const button = (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 hover:scale-105 transition-all duration-150', className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});
WebPreviewNavigationButton.displayName = 'WebPreviewNavigationButton';

const WebPreviewUrl = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, value: propValue, onChange: propOnChange, onKeyDown: propOnKeyDown, ...props }, ref) => {
  const { url, setUrl, goBack, goForward, refresh, canGoBack, canGoForward } =
    useWebPreview();
  const [inputValue, setInputValue] = React.useState(url);

  React.useEffect(() => {
    if (propValue !== undefined) {
      setInputValue(propValue);
    } else {
      setInputValue(url);
    }
  }, [propValue, url]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setUrl(e.currentTarget.value);
    }
    propOnKeyDown?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    propOnChange?.(e);
  };

  const displayValue = propValue ?? inputValue;

  return (
    <>
      <WebPreviewNavigationButton
        tooltip="Go back"
        onClick={goBack}
        disabled={!canGoBack}
      >
        <ChevronLeft className="h-4 w-4" />
      </WebPreviewNavigationButton>
      <WebPreviewNavigationButton
        tooltip="Go forward"
        onClick={goForward}
        disabled={!canGoForward}
      >
        <ChevronRight className="h-4 w-4" />
      </WebPreviewNavigationButton>
      <WebPreviewNavigationButton tooltip="Refresh" onClick={refresh}>
        <RotateCw className="h-4 w-4" />
      </WebPreviewNavigationButton>
      <Input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn('flex-1 h-8', className)}
        placeholder="Enter URL..."
        {...props}
      />
    </>
  );
});
WebPreviewUrl.displayName = 'WebPreviewUrl';

interface WebPreviewBodyProps
  extends Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, 'loading'> {
  loading?: React.ReactNode;
  srcDoc?: string;
}

const WebPreviewBody = React.forwardRef<HTMLIFrameElement, WebPreviewBodyProps>(
  ({ loading, className, src, srcDoc, ...props }, ref) => {
    const { url } = useWebPreview();
    const [isLoading, setIsLoading] = React.useState(true);

    const iframeSrc = src || url || undefined;
    const iframeSrcDoc = srcDoc || undefined;

    React.useEffect(() => {
      setIsLoading(true);
    }, [iframeSrc, iframeSrcDoc]);

    const hasContent = Boolean(iframeSrc || iframeSrcDoc);

    return (
      <div className="relative flex-1 bg-background">
        {isLoading && loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            {loading}
          </div>
        )}
        {hasContent ? (
          <iframe
            ref={ref}
            src={iframeSrc}
            srcDoc={iframeSrcDoc}
            className={cn('h-full w-full border-0', className)}
            onLoad={() => setIsLoading(false)}
            {...props}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <p className="text-sm text-muted-foreground">No preview available</p>
          </div>
        )}
      </div>
    );
  }
);
WebPreviewBody.displayName = 'WebPreviewBody';

interface ConsoleLog {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

interface WebPreviewConsoleProps extends React.HTMLAttributes<HTMLDivElement> {
  logs: ConsoleLog[];
}

const WebPreviewConsole = React.forwardRef<
  HTMLDivElement,
  WebPreviewConsoleProps
>(({ logs, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col border-t bg-muted/30 max-h-48 overflow-y-auto',
        className
      )}
      {...props}
    >
      <div className="sticky top-0 bg-muted px-3 py-2 text-sm font-semibold border-b">
        Console
      </div>
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No console logs
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={cn(
                'border-b px-3 py-2 text-sm font-mono',
                log.level === 'error' && 'text-red-600 dark:text-red-400',
                log.level === 'warn' && 'text-yellow-600 dark:text-yellow-400'
              )}
            >
              <span className="text-muted-foreground mr-2">
                [{log.timestamp.toLocaleTimeString()}]
              </span>
              <span className="font-semibold mr-2 uppercase">
                {log.level}:
              </span>
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
WebPreviewConsole.displayName = 'WebPreviewConsole';

export {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
};
