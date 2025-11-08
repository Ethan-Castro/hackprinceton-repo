'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Slide {
  title: string;
  type:
    | 'cover'
    | 'problem'
    | 'solution'
    | 'market'
    | 'product'
    | 'business-model'
    | 'traction'
    | 'competition'
    | 'team'
    | 'financials'
    | 'ask'
    | 'custom';
  content: string;
  bullets?: string[];
  metrics?: Array<{
    label: string;
    value: string;
  }>;
}

interface PitchDeckProps {
  companyName: string;
  tagline: string;
  slides: Slide[];
  className?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const getSlideGradient = (type: Slide['type']) => {
  switch (type) {
    case 'cover':
      return 'from-blue-900 via-slate-900 to-blue-900';
    case 'problem':
      return 'from-red-900 via-slate-900 to-slate-900';
    case 'solution':
      return 'from-green-900 via-slate-900 to-slate-900';
    case 'market':
      return 'from-purple-900 via-slate-900 to-slate-900';
    case 'traction':
      return 'from-emerald-900 via-slate-900 to-slate-900';
    case 'financials':
      return 'from-blue-900 via-slate-900 to-slate-900';
    default:
      return 'from-slate-900 via-slate-800 to-slate-900';
  }
};

export const PitchDeck: React.FC<PitchDeckProps> = ({ companyName, tagline, slides, className }) => {
  const [[currentSlide, direction], setCurrentSlide] = React.useState([0, 0]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const paginate = React.useCallback(
    (newDirection: number) => {
      const nextSlide = currentSlide + newDirection;
      if (nextSlide >= 0 && nextSlide < slides.length) {
        setCurrentSlide([nextSlide, newDirection]);
      }
    },
    [currentSlide, slides.length]
  );

  const goToSlide = (index: number) => {
    const newDirection = index > currentSlide ? 1 : -1;
    setCurrentSlide([index, newDirection]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        paginate(-1);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen, paginate]);

  const currentSlideData = slides[currentSlide];

  const slideContent = (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-card shadow-lg overflow-hidden',
        isFullscreen && 'h-full rounded-none border-0',
        className
      )}
    >
      {/* Navigation Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Presentation className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-bold text-white">{companyName}</p>
            <p className="text-xs text-slate-400">{tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Slide counter */}
          <span className="text-xs text-slate-400 font-medium">
            {currentSlide + 1} / {slides.length}
          </span>

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0 text-slate-400">
            {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-white bg-gradient-to-br',
              getSlideGradient(currentSlideData.type)
            )}
          >
            {/* Cover Slide */}
            {currentSlideData.type === 'cover' && (
              <div className="text-center space-y-6 max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{companyName}</h1>
                <p className="text-2xl md:text-3xl text-blue-200 font-light">{tagline}</p>
                <div className="prose prose-invert prose-lg max-w-none mt-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentSlideData.content}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Standard Slides */}
            {currentSlideData.type !== 'cover' && (
              <div className="w-full max-w-5xl space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{currentSlideData.title}</h2>

                {/* Content */}
                {currentSlideData.content && (
                  <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentSlideData.content}</ReactMarkdown>
                  </div>
                )}

                {/* Bullets */}
                {currentSlideData.bullets && currentSlideData.bullets.length > 0 && (
                  <ul className="space-y-4">
                    {currentSlideData.bullets.map((bullet, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 text-lg md:text-xl"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="flex-1 pt-1">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {/* Metrics */}
                {currentSlideData.metrics && currentSlideData.metrics.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                    {currentSlideData.metrics.map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{metric.value}</p>
                        <p className="text-sm text-slate-300 uppercase tracking-wide">{metric.label}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Slide Number (bottom right) */}
            <div className="absolute bottom-8 right-8 text-sm text-white/40 font-mono">
              {currentSlide + 1}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={() => paginate(-1)}
          disabled={currentSlide === 0}
          className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur flex items-center justify-center text-white transition-all',
            currentSlide === 0 && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={() => paginate(1)}
          disabled={currentSlide === slides.length - 1}
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur flex items-center justify-center text-white transition-all',
            currentSlide === slides.length - 1 && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Slide Thumbnails */}
      <div className="bg-slate-900 border-t border-slate-700 p-4 overflow-x-auto">
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded text-xs font-medium transition-all',
                currentSlide === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              )}
            >
              {index + 1}. {slide.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 bg-slate-950">{slideContent}</div>;
  }

  return slideContent;
};
