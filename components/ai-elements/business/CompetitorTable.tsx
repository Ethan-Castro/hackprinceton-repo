'use client';

import * as React from 'react';
import { Swords, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: string;
  pricing?: string;
  targetMarket?: string;
}

interface ComparisonFeature {
  feature: string;
  scores: Record<string, string | number | boolean>;
}

interface CompetitorTableProps {
  title: string;
  competitors: Competitor[];
  comparisonMatrix?: ComparisonFeature[];
  positioning?: string;
  recommendations?: string[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

const renderCellValue = (value: string | number | boolean) => {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
    );
  }
  return <span className="text-sm">{value}</span>;
};

export const CompetitorTable: React.FC<CompetitorTableProps> = ({
  title,
  competitors,
  comparisonMatrix,
  positioning,
  recommendations,
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
        className="bg-gradient-to-r from-red-900 via-orange-900 to-red-900 border-b px-6 py-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            className="rounded-lg bg-orange-500/20 p-2 backdrop-blur"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Swords className="h-5 w-5 text-orange-200" />
          </motion.div>
          <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">
            Competitive Analysis
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h1>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Competitor Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {competitors.map((competitor, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{competitor.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{competitor.description}</p>
                </div>
                {competitor.marketShare && (
                  <span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-bold whitespace-nowrap">
                    {competitor.marketShare}
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                {competitor.pricing && (
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Pricing: </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">{competitor.pricing}</span>
                  </div>
                )}
                {competitor.targetMarket && (
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Target: </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">{competitor.targetMarket}</span>
                  </div>
                )}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-1 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
                    Weaknesses
                  </p>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-1 text-xs text-slate-700 dark:text-slate-300">
                        <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Matrix */}
        {comparisonMatrix && comparisonMatrix.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-600">
                      Feature
                    </th>
                    {competitors.map((competitor, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-center text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-600"
                      >
                        {competitor.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrix.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {row.feature}
                      </td>
                      {competitors.map((competitor, compIndex) => (
                        <td key={compIndex} className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                          {renderCellValue(row.scores[competitor.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Positioning */}
        {positioning && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
          >
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">Our Competitive Positioning</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{positioning}</p>
          </motion.div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Strategic Recommendations</h2>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{recommendation}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
