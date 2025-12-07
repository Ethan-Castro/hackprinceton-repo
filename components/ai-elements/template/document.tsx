"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Loader2,
  Mail,
  Share2,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyHtml2CanvasSafePalette } from "@/lib/html2canvas-safe";
import { cn } from "@/lib/utils";
import type { TemplateBlock, TemplateDocument, TemplateMetric, TemplateSection, TemplateTimelineStep } from "@/types/template-document";

type DynamicTemplateDocumentProps = {
  template: TemplateDocument;
  isStreaming?: boolean;
  className?: string;
};

const toneStyles: Record<string, string> = {
  info: "border border-blue-200/60 bg-blue-500/10 text-blue-900 dark:text-blue-100",
  success: "border border-emerald-200/60 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  warning: "border border-amber-200/60 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  danger: "border border-rose-200/60 bg-rose-500/10 text-rose-900 dark:text-rose-100",
};

export function DynamicTemplateDocument({
  template,
  isStreaming,
  className,
}: DynamicTemplateDocumentProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const markdown = useMemo(() => templateToMarkdown(template), [template]);
  const emailBody = useMemo(() => templateToEmailBody(template), [template]);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(template.title)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!docRef.current) return;
    setIsExportingPdf(true);
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(docRef.current, {
      scale: window.devicePixelRatio || 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      onclone: applyHtml2CanvasSafePalette,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${slugify(template.title)}.pdf`);
    setIsExportingPdf(false);
  };

  const openEmailDraft = () => {
    const subject = encodeURIComponent(template.title);
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <motion.div
      ref={docRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative my-4 flex flex-col gap-6 rounded-3xl border border-border/80 bg-gradient-to-br from-background to-muted/30 p-6 shadow-border-medium",
        className,
      )}
    >
      {isStreaming && (
        <div className="pointer-events-none absolute inset-x-6 top-6 flex items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Tool output streaming…
        </div>
      )}

      <header className="space-y-4 pt-2">
        <div className="flex flex-wrap items-start gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {template.type}
          </span>
          {template.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-muted-foreground/20 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{template.title}</h2>
            {template.subtitle && (
              <p className="text-base text-muted-foreground">{template.subtitle}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyMarkdown} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Markdown"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share / Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={downloadJson}>Download JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadPdf} disabled={isExportingPdf}>
                  {isExportingPdf ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Preparing PDF
                    </span>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openEmailDraft}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Summary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {template.summary && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {template.summary}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {template.audience && (
            <MetaCard icon={<User className="h-4 w-4" />} label="Audience" value={template.audience} />
          )}
          {template.duration && (
            <MetaCard icon={<Clock className="h-4 w-4" />} label="Duration" value={template.duration} />
          )}
          {template.difficulty && (
            <MetaCard icon={<Target className="h-4 w-4" />} label="Focus" value={template.difficulty} />
          )}
          {template.owner && (
            <MetaCard icon={<ClipboardList className="h-4 w-4" />} label="Owner" value={template.owner} />
          )}
        </div>

        {template.status && <StatusBanner status={template.status} />}
        {template.metrics && template.metrics.length > 0 && (
          <MetricsStrip metrics={template.metrics} />
        )}
      </header>

      <div className="space-y-6">
        {template.sections.map((section, index) => (
          <TemplateSectionBlock key={section.id ?? `${section.title}-${index}`} section={section} />
        ))}
      </div>

      {template.resources && template.resources.length > 0 && (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            Resources
          </p>
          <ul className="space-y-2">
            {template.resources.map((resource) => (
              <li key={resource.title}>
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-between rounded-xl border border-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/10"
                  >
                    <span>
                      <span className="font-medium">{resource.title}</span>
                      {resource.description && (
                        <span className="block text-xs text-muted-foreground">
                          {resource.description}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="rounded-xl border border-muted/50 px-4 py-2">
                    <p className="font-medium text-sm">{resource.title}</p>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function StatusBanner({
  status,
}: {
  status: NonNullable<TemplateDocument["status"]>;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          <Loader2 className={cn("h-3.5 w-3.5", status.state === "ready" ? "text-emerald-500" : "animate-spin")} />
          {status.label}
        </span>
        {status.updatedAt && (
          <span className="text-xs text-muted-foreground">
            Updated {status.updatedAt}
          </span>
        )}
        {status.eta && (
          <span className="text-xs text-muted-foreground">ETA {status.eta}</span>
        )}
      </div>
      {typeof status.progress === "number" && (
        <div className="h-2 w-full rounded-full bg-primary/10">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function MetricsStrip({ metrics }: { metrics: TemplateMetric[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={`${metric.label}-${metric.value}`}
          className="rounded-2xl border border-muted/40 bg-background/60 px-4 py-3"
        >
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {metric.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{metric.value}</span>
            {metric.helper && (
              <span
                className={cn(
                  "text-xs font-medium",
                  metric.trend === "down" ? "text-rose-500" : "text-emerald-500",
                )}
              >
                {metric.helper}
                {metric.trend === "up" && <ArrowUpRight className="ml-1 inline h-3 w-3" />}
                {metric.trend === "down" && <ArrowDownRight className="ml-1 inline h-3 w-3" />}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplateSectionBlock({ section }: { section: TemplateSection }) {
  return (
    <section className="space-y-4 rounded-2xl border border-muted/40 bg-card/60 p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {section.accent ?? "Section"}
        </p>
        <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
      </div>
      <div
        className={cn(
          "grid gap-3",
          section.layout === "grid" ? "md:grid-cols-2" : "grid-cols-1",
        )}
      >
        {section.blocks.map((block, index) => (
          <TemplateBlockRenderer key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}

function TemplateBlockRenderer({ block }: { block: TemplateBlock }) {
  switch (block.type) {
    case "text":
      return (
        <div className="rounded-2xl border border-muted/40 bg-background/60 p-4">
          {block.title && (
            <p className="text-sm font-semibold text-muted-foreground">{block.title}</p>
          )}
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              block.variant === "muted" && "text-muted-foreground",
              block.variant === "quote" && "border-l-4 border-primary/40 pl-3 italic",
            )}
          >
            {block.body}
          </p>
        </div>
      );

    case "callout":
      return (
        <div className={cn("rounded-2xl p-4 text-sm", toneStyles[block.tone ?? "info"])}>
          {block.title && <p className="font-semibold">{block.title}</p>}
          <p className="mt-1 leading-relaxed">{block.body}</p>
        </div>
      );

    case "list":
      if (block.style === "cards") {
        return (
          <div className="grid gap-2">
            {block.title && (
              <p className="text-sm font-semibold text-muted-foreground">{block.title}</p>
            )}
            {block.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-muted/40 bg-background/60 px-4 py-3"
              >
                <p className="font-medium">{item.title}</p>
                {item.detail && (
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                )}
                {item.badge && (
                  <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="rounded-2xl border border-muted/40 bg-background/60 p-4">
          {block.title && (
            <p className="text-sm font-semibold text-muted-foreground">{block.title}</p>
          )}
          <ul className="mt-2 space-y-2 text-sm leading-relaxed">
            {block.items.map((item, index) => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-muted">
                  {block.style === "ordered" ? index + 1 : "•"}
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.detail && (
                    <p className="text-muted-foreground">{item.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      );

    case "checklist":
      return (
        <div className="rounded-2xl border border-muted/40 bg-background/60 p-4">
          {block.title && (
            <p className="text-sm font-semibold text-muted-foreground">{block.title}</p>
          )}
          <ul className="mt-3 space-y-2">
            {block.items.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                    item.checked
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-muted text-muted-foreground",
                  )}
                >
                  {item.checked ? <Check className="h-3.5 w-3.5" /> : ""}
                </span>
                <div>
                  <p className="font-medium">{item.label}</p>
                  {item.note && (
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  )}
                  {item.due && (
                    <p className="text-xs text-muted-foreground">Due {item.due}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      );

    case "timeline":
      return (
        <div className="rounded-2xl border border-muted/40 bg-background/60 p-4">
          {block.title && (
            <p className="text-sm font-semibold text-muted-foreground">{block.title}</p>
          )}
          <div className="mt-3 space-y-4">
            {block.steps.map((step, idx) => (
              <TimelineRow key={step.title} step={step} isLast={idx === block.steps.length - 1} />
            ))}
          </div>
        </div>
      );

    case "metrics":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {block.title && (
            <p className="sm:col-span-2 text-sm font-semibold text-muted-foreground">
              {block.title}
            </p>
          )}
          {block.items.map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-2xl border border-muted/40 bg-background/60 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-xl font-semibold">{metric.value}</p>
              {metric.helper && (
                <p className="text-xs text-muted-foreground">{metric.helper}</p>
              )}
            </div>
          ))}
        </div>
      );

    case "resources":
      return (
        <div className="rounded-2xl border border-muted/40 bg-background/60 p-4">
          {block.title && (
            <p className="text-sm font-semibold text-muted-foreground">{block.title}</p>
          )}
          <div className="mt-3 space-y-2">
            {block.items.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-muted/40 px-4 py-2 text-sm hover:bg-muted/40"
              >
                <span>
                  <span className="font-medium">{resource.title}</span>
                  {resource.description && (
                    <span className="block text-xs text-muted-foreground">
                      {resource.description}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm italic">
          “{block.body}”
          {block.attribution && (
            <span className="mt-2 block text-right text-xs uppercase tracking-wide">
              — {block.attribution}
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
}

function TimelineRow({ step, isLast }: { step: TemplateTimelineStep; isLast: boolean }) {
  return (
    <div className="relative flex gap-3 pl-6">
      {!isLast && (
        <span className="absolute left-[11px] top-5 h-[calc(100%-20px)] w-px bg-muted" />
      )}
      <span
        className={cn(
          "absolute left-0 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs",
          step.status === "done" && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
          step.status === "current" && "border-primary bg-primary/10 text-primary",
          step.status === "pending" && "border-muted text-muted-foreground",
        )}
      >
        {step.status === "done" ? <Check className="h-3 w-3" /> : ""}
      </span>
      <div>
        <p className="font-medium">{step.title}</p>
        {step.detail && (
          <p className="text-sm text-muted-foreground">{step.detail}</p>
        )}
        {step.timestamp && (
          <p className="text-xs text-muted-foreground">Target: {step.timestamp}</p>
        )}
      </div>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-muted/40 bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold leading-tight">{value}</p>
    </div>
  );
}

export function TemplateDocumentSkeleton() {
  return (
    <div className="my-4 animate-pulse space-y-4 rounded-3xl border border-dashed border-muted/60 bg-muted/30 p-6">
      <div className="h-4 w-20 rounded-full bg-muted" />
      <div className="h-8 w-2/3 rounded bg-muted" />
      <div className="h-16 rounded bg-muted/80" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 rounded-2xl bg-muted/80" />
        ))}
      </div>
    </div>
  );
}

function templateToMarkdown(doc: TemplateDocument) {
  let md = `# ${doc.title}\n\n`;
  if (doc.subtitle) md += `_${doc.subtitle}_\n\n`;
  if (doc.summary) md += `${doc.summary}\n\n`;

  doc.sections.forEach((section, sectionIndex) => {
    md += `## ${sectionIndex + 1}. ${section.title}\n`;
    if (section.description) {
      md += `${section.description}\n\n`;
    }

    section.blocks.forEach((block) => {
      switch (block.type) {
        case "text":
          if (block.title) md += `### ${block.title}\n`;
          md += `${block.body}\n\n`;
          break;
        case "callout":
          md += `> **${block.title ?? "Callout"}**: ${block.body}\n\n`;
          break;
        case "list":
          if (block.title) md += `### ${block.title}\n`;
          block.items.forEach((item, idx) => {
            const bullet = block.style === "ordered" ? `${idx + 1}.` : "-";
            md += `${bullet} **${item.title}** — ${item.detail ?? ""}\n`;
          });
          md += "\n";
          break;
        case "checklist":
          if (block.title) md += `### ${block.title}\n`;
          block.items.forEach((item) => {
            md += `- [${item.checked ? "x" : " "}] ${item.label}${item.note ? ` — ${item.note}` : ""}\n`;
          });
          md += "\n";
          break;
        case "timeline":
          if (block.title) md += `### ${block.title}\n`;
          block.steps.forEach((step) => {
            md += `- **${step.title}** (${step.status ?? "pending"}) ${step.detail ?? ""}\n`;
          });
          md += "\n";
          break;
        case "metrics":
          if (block.title) md += `### ${block.title}\n`;
          block.items.forEach((metric) => {
            md += `- ${metric.label}: ${metric.value} ${metric.helper ?? ""}\n`;
          });
          md += "\n";
          break;
        case "resources":
          if (block.title) md += `### ${block.title}\n`;
          block.items.forEach((resource) => {
            md += `- [${resource.title}](${resource.url ?? "#"}) ${resource.description ?? ""}\n`;
          });
          md += "\n";
          break;
        case "quote":
          md += `> ${block.body}\n`;
          if (block.attribution) md += `> — ${block.attribution}\n`;
          md += "\n";
          break;
        default:
          break;
      }
    });
  });

  if (doc.resources?.length) {
    md += "## Resources\n";
    doc.resources.forEach((resource) => {
      md += `- [${resource.title}](${resource.url ?? "#"}) ${resource.description ?? ""}\n`;
    });
  }

  return md.trim();
}

function templateToEmailBody(doc: TemplateDocument) {
  const lines: string[] = [];
  lines.push(`${doc.title}`);
  if (doc.summary) lines.push("", doc.summary);
  doc.sections.forEach((section) => {
    lines.push("", `${section.title}`);
    section.blocks.forEach((block) => {
      if (block.type === "text") {
        lines.push(`- ${block.body}`);
      }
      if (block.type === "list") {
        block.items.forEach((item) => lines.push(`• ${item.title} ${item.detail ?? ""}`));
      }
      if (block.type === "checklist") {
        block.items.forEach((item) =>
          lines.push(`• [${item.checked ? "x" : " "}] ${item.label} ${item.note ?? ""}`),
        );
      }
    });
  });
  return lines.join("\n");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
