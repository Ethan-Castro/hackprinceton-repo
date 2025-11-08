'use client';

import * as React from 'react';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface MarketSize {
  tam?: {
    value: string;
    description: string;
  };
  sam?: {
    value: string;
    description: string;
  };
  som?: {
    value: string;
    description: string;
  };
}

interface Trend {
  title: string;
  description: string;
  impact?: 'high' | 'medium' | 'low';
}

interface CustomerSegment {
  name: string;
  description: string;
  size?: string;
  characteristics?: string[];
}

interface MarketAnalysisProps {
  title: string;
  industry: string;
  marketSize: MarketSize;
  trends: Trend[];
  customerSegments: CustomerSegment[];
  competitiveLandscape: string;
  barriers?: string[];
  opportunities?: string[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const ImpactBadge: React.FC<{ impact?: 'high' | 'medium' | 'low' }> = ({ impact }) => {
  if (!impact) return null;

  const styles = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  return (
    <span className={cn('px-2 py-1 rounded text-xs font-semibold uppercase', styles[impact])}>
      {impact} impact
    </span>
  );
};

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({
  title,
  industry,
  marketSize,
  trends,
  customerSegments,
  competitiveLandscape,
  barriers,
  opportunities,
  className,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn('flex flex-col rounded-xl border bg-card shadow-lg overflow-hidden', className)}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 border-b px-6 py-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            className="rounded-lg bg-blue-500/20 p-2 backdrop-blur"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <BarChart3 className="h-5 w-5 text-blue-200" />
          </motion.div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Market Analysis</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">{title}</h1>
        <p className="text-blue-100 text-sm">{industry}</p>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Market Size */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Market Size
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketSize.tam && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide mb-2">
                  Total Addressable Market
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">{marketSize.tam.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{marketSize.tam.description}</p>
              </div>
            )}
            {marketSize.sam && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg p-5 border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide mb-2">
                  Serviceable Addressable Market
                </p>
                <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">{marketSize.sam.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{marketSize.sam.description}</p>
              </div>
            )}
            {marketSize.som && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wide mb-2">
                  Serviceable Obtainable Market
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">{marketSize.som.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{marketSize.som.description}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trends */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Market Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{trend.title}</h3>
                  <ImpactBadge impact={trend.impact} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{trend.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Segments */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Customer Segments
          </h2>
          <div className="space-y-4">
            {customerSegments.map((segment, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/20 rounded-lg p-5 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{segment.name}</h3>
                  {segment.size && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {segment.size}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{segment.description}</p>
                {segment.characteristics && segment.characteristics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {segment.characteristics.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Competitive Landscape */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Competitive Landscape</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{competitiveLandscape}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Barriers and Opportunities */}
        {(barriers || opportunities) && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barriers && barriers.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-3">Market Entry Barriers</h3>
                <ul className="space-y-2">
                  {barriers.map((barrier, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5"></span>
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {opportunities && opportunities.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3">Market Opportunities</h3>
                <ul className="space-y-2">
                  {opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5"></span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
