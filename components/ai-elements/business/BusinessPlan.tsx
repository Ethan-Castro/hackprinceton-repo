'use client';

import * as React from 'react';
import { Briefcase, Maximize2, X, Download, FileText, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { applyHtml2CanvasSafePalette } from '@/lib/html2canvas-safe';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BusinessPlanProps {
  companyName: string;
  executiveSummary: string;
  sections: Array<{
    title: string;
    content: string;
    subsections?: Array<{
      title: string;
      content: string;
    }>;
  }>;
  financialHighlights?: {
    projectedRevenue?: string;
    fundingRequested?: string;
    breakEvenTimeline?: string;
  };
  className?: string;
}

// Animation variants - subtle and professional
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Section component with scroll-triggered animation
const AnimatedSection: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={sectionVariants}
    >
      {children}
    </motion.section>
  );
};

export const BusinessPlan: React.FC<BusinessPlanProps> = ({
  companyName,
  executiveSummary,
  sections,
  financialHighlights,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const planRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle ESC key to exit fullscreen
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Export handlers
  const exportAsPDF = async () => {
    if (!planRef.current) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(planRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
      onclone: applyHtml2CanvasSafePalette,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${companyName.replace(/\s+/g, '_')}_Business_Plan.pdf`);
  };

  const exportAsMarkdown = () => {
    let markdown = `# ${companyName} - Business Plan\n\n`;
    markdown += `## Executive Summary\n\n${executiveSummary}\n\n`;

    if (financialHighlights) {
      markdown += `## Financial Highlights\n\n`;
      if (financialHighlights.projectedRevenue) {
        markdown += `- **Projected Revenue:** ${financialHighlights.projectedRevenue}\n`;
      }
      if (financialHighlights.fundingRequested) {
        markdown += `- **Funding Requested:** ${financialHighlights.fundingRequested}\n`;
      }
      if (financialHighlights.breakEvenTimeline) {
        markdown += `- **Break-Even Timeline:** ${financialHighlights.breakEvenTimeline}\n`;
      }
      markdown += `\n`;
    }

    sections.forEach((section) => {
      markdown += `## ${section.title}\n\n${section.content}\n\n`;

      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          markdown += `### ${subsection.title}\n\n${subsection.content}\n\n`;
        });
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, '_')}_Business_Plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    if (!planRef.current) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - Business Plan</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 3rem; line-height: 1.7; color: #1e293b; }
    h1 { color: #0f172a; font-size: 2.5rem; border-bottom: 3px solid #1e40af; padding-bottom: 1rem; margin-bottom: 2rem; }
    h2 { color: #1e40af; margin-top: 2.5rem; font-size: 1.75rem; }
    h3 { color: #3b82f6; margin-top: 1.5rem; font-size: 1.25rem; }
    .company-name { color: #1e40af; font-weight: 700; }
    .executive-summary { background: linear-gradient(to right, #eff6ff, #dbeafe); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #1e40af; margin: 2rem 0; }
    .financial-highlights { background: #f8fafc; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; margin: 2rem 0; }
    .financial-highlights h3 { margin-top: 0; }
  </style>
</head>
<body>
  ${planRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, '_')}_Business_Plan.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const planContent = (
    <motion.div
      ref={planRef}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        'flex flex-col rounded-xl border bg-card shadow-lg overflow-hidden',
        isFullscreen && 'h-full rounded-none border-0',
        className
      )}
    >
      {/* Header */}
      <motion.div
        variants={headerVariants}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b px-6 py-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="rounded-lg bg-blue-500/20 p-2.5 backdrop-blur"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Briefcase className="h-5 w-5 text-blue-200" />
            </motion.div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Business Plan
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-blue-100 hover:text-white hover:bg-blue-800/50"
            >
              {isFullscreen ? (
                <X className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-blue-100 hover:text-white hover:bg-blue-800/50"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  <span className="text-xs font-medium">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportAsPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsMarkdown}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsHTML}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {companyName}
        </h1>
        <p className="text-blue-100 text-sm mt-1">Comprehensive Business Plan</p>
      </motion.div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-8">
        {/* Executive Summary */}
        <motion.div
          variants={sectionVariants}
          className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20 rounded-lg p-6 border-l-4 border-blue-600"
        >
          <h2 className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">
            Executive Summary
          </h2>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {executiveSummary}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Financial Highlights */}
        {financialHighlights && (
          <motion.div
            variants={sectionVariants}
            className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Financial Highlights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {financialHighlights.projectedRevenue && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                    Projected Revenue
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {financialHighlights.projectedRevenue}
                  </p>
                </div>
              )}
              {financialHighlights.fundingRequested && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                    Funding Requested
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {financialHighlights.fundingRequested}
                  </p>
                </div>
              )}
              {financialHighlights.breakEvenTimeline && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                    Break-Even Timeline
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {financialHighlights.breakEvenTimeline}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <AnimatedSection key={index}>
              <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  {section.title}
                </h2>

                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none pl-11">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.content}
                  </ReactMarkdown>
                </div>

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="ml-11 space-y-4 pl-6 border-l-2 border-slate-300 dark:border-slate-600">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex} className="space-y-2">
                        <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200">
                          {subsection.title}
                        </h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {subsection.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        {planContent}
      </div>
    );
  }

  return planContent;
};
