'use client';

import * as React from 'react';
import { BookOpen, Maximize2, X, Download, FileText, Printer } from 'lucide-react';
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

interface TextbookChapterProps {
  title: string;
  introduction: string;
  sections: Array<{
    heading: string;
    content: string;
    subsections?: Array<{
      subheading: string;
      content: string;
    }>;
  }>;
  conclusion?: string;
  className?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const introVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

// Section component with scroll-triggered animation
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  index: number;
}> = ({ children, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={sectionVariants}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {children}
    </motion.section>
  );
};

export const TextbookChapter: React.FC<TextbookChapterProps> = ({
  title,
  introduction,
  sections,
  conclusion,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const chapterRef = React.useRef<HTMLDivElement>(null);

  // Fullscreen toggle
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
    if (!chapterRef.current) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(chapterRef.current, {
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
    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const exportAsMarkdown = () => {
    let markdown = `# ${title}\n\n`;

    if (introduction) {
      markdown += `${introduction}\n\n`;
    }

    sections.forEach((section, index) => {
      markdown += `## ${index + 1}. ${section.heading}\n\n`;
      markdown += `${section.content}\n\n`;

      if (section.subsections) {
        section.subsections.forEach((subsection, subIndex) => {
          markdown += `### ${index + 1}.${subIndex + 1} ${subsection.subheading}\n\n`;
          markdown += `${subsection.content}\n\n`;
        });
      }
    });

    if (conclusion) {
      markdown += `## Conclusion\n\n${conclusion}\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    if (!chapterRef.current) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 0.5rem; }
    h2 { color: #6366f1; margin-top: 2rem; }
    h3 { color: #818cf8; margin-top: 1.5rem; }
    .intro { border-left: 4px solid #4f46e5; padding-left: 1rem; color: #6b7280; font-size: 1.125rem; }
    .conclusion { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 2rem; }
  </style>
</head>
<body>
  ${chapterRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const chapterContent = (
    <motion.div
      ref={chapterRef}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        'flex flex-col rounded-2xl border bg-card shadow-border-medium overflow-hidden',
        isFullscreen && 'h-full rounded-none border-0',
        className
      )}
    >
      {/* Chapter Header */}
      <motion.div
        variants={headerVariants}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b px-6 py-5"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <motion.div
              className="rounded-lg bg-indigo-500/10 p-2"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              Chapter
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <X className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Download className="h-4 w-4 mr-1" />
                  <span className="text-xs">Export</span>
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h1>
      </motion.div>

      {/* Chapter Content */}
      <div className="p-6 space-y-8">
        {/* Introduction */}
        {introduction && (
          <motion.div
            variants={introVariants}
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
          >
            <div className="text-lg leading-relaxed text-muted-foreground border-l-4 border-indigo-500/50 pl-4 py-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {introduction}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <AnimatedSection key={index} index={index}>
              <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                <motion.span
                  className="text-indigo-600 dark:text-indigo-400"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {index + 1}.
                </motion.span>
                {section.heading}
              </h2>

              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.content}
                </ReactMarkdown>
              </div>

              {/* Subsections */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="ml-4 space-y-4 border-l-2 border-muted pl-4">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="space-y-2">
                      <h3 className="text-lg md:text-xl font-semibold">
                        {index + 1}.{subIndex + 1} {subsection.subheading}
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

        {/* Conclusion */}
        {conclusion && (
          <motion.div
            variants={introVariants}
            className="mt-8 pt-6 border-t"
          >
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">
              Conclusion
            </h2>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <div className="text-base leading-relaxed bg-muted/50 rounded-lg p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {conclusion}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        {chapterContent}
      </div>
    );
  }

  return chapterContent;
};
