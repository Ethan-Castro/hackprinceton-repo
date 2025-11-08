"use client";

import * as React from "react";
import { Brain, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MindMapNode {
  title: string;
  summary?: string;
  icon?: string;
  color?: string;
  insights?: string[];
  children?: MindMapNode[];
}

interface MindMapProps {
  centralTopic: string;
  perspective?: string;
  branches: MindMapNode[];
  insights?: string[];
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const palette = [
  "#4f46e5",
  "#0891b2",
  "#16a34a",
  "#f97316",
  "#db2777",
  "#0ea5e9",
];

const getAccent = (node: MindMapNode, index: number) => {
  if (node.color) return node.color;
  return palette[index % palette.length];
};

const NodeCard: React.FC<{
  node: MindMapNode;
  depth: number;
  index: number;
  path: string;
  expandedMap: Record<string, boolean>;
  onToggle: (key: string) => void;
}> = ({ node, depth, index, path, expandedMap, onToggle }) => {
  const hasChildren = Boolean(node.children?.length);
  const accent = getAccent(node, index);
  const isExpanded = expandedMap[path] ?? (depth === 0);

  return (
    <div className="relative space-y-3">
      {depth > 0 && (
        <span className="absolute left-[-18px] top-5 h-px w-4 bg-border" aria-hidden />
      )}
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.25, delay: depth * 0.05 }}
        className={cn(
          "rounded-2xl border shadow-border-medium p-4 bg-card",
          depth === 0 && "bg-gradient-to-br from-primary/10 to-primary/0"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-base font-semibold"
            style={{ backgroundColor: accent + "1A", color: accent }}
          >
            {node.icon || node.title.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold leading-tight">{node.title}</h4>
              {hasChildren && (
                <button
                  className="rounded-full border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => onToggle(path)}
                  aria-pressed={isExpanded}
                  aria-label={`Toggle ${node.title}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
            {node.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">{node.summary}</p>
            )}
            {node.insights && (
              <div className="flex flex-wrap gap-2 pt-1">
                {node.insights.map((tip, tipIndex) => (
                  <span
                    key={`${path}-tip-${tipIndex}`}
                    className="text-xs px-2 py-1 rounded-full bg-muted/60 text-muted-foreground"
                  >
                    {tip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {hasChildren && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="pl-6 border-l border-dashed border-border space-y-4"
            >
              {node.children?.map((child, childIndex) => (
                <NodeCard
                  key={`${path}-${childIndex}`}
                  node={child}
                  depth={depth + 1}
                  index={childIndex}
                  path={`${path}-${childIndex}`}
                  expandedMap={expandedMap}
                  onToggle={onToggle}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export const MindMap: React.FC<MindMapProps> = ({
  centralTopic,
  perspective,
  branches,
  insights,
  className,
}) => {
  const [openNodes, setOpenNodes] = React.useState<Record<string, boolean>>(() => {
    // expand first level by default
    const defaults: Record<string, boolean> = {};
    branches.forEach((_, index) => {
      defaults[`root-${index}`] = true;
    });
    return defaults;
  });

  React.useEffect(() => {
    const defaults: Record<string, boolean> = {};
    branches.forEach((_, index) => {
      defaults[`root-${index}`] = true;
    });
    setOpenNodes(defaults);
  }, [branches]);

  const handleToggle = (key: string) => {
    setOpenNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      className={cn(
        "rounded-3xl border bg-card/50 shadow-border-medium overflow-hidden",
        className
      )}
    >
      <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 via-transparent to-secondary/10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Brain className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">
              Personalized Mind Map
            </p>
            <h2 className="text-2xl font-bold leading-tight">{centralTopic}</h2>
            {perspective && (
              <p className="text-sm text-muted-foreground">
                Lens: {perspective}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid gap-6">
          {branches.map((branch, index) => (
            <NodeCard
              key={`root-${index}`}
              node={branch}
              depth={0}
              index={index}
              path={`root-${index}`}
              expandedMap={openNodes}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {insights && insights.length > 0 && (
          <div className="rounded-2xl border bg-muted/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Study sparks
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {insights.map((tip, index) => (
                <li key={`insight-${index}`} className="flex gap-2">
                  <span className="text-primary font-semibold">{index + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
