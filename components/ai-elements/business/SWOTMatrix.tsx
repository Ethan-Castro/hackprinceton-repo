'use client';

import * as React from 'react';
import { Shield, AlertTriangle, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SWOTItem {
  title: string;
  description: string;
}

interface SWOTMatrixProps {
  title: string;
  context: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  recommendations?: string[];
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

const QuadrantCard: React.FC<{
  title: string;
  items: SWOTItem[];
  icon: React.ReactNode;
  colorClasses: {
    bg: string;
    border: string;
    iconBg: string;
    iconText: string;
    titleText: string;
  };
}> = ({ title, items, icon, colorClasses }) => {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'rounded-lg p-6 border-2',
        colorClasses.bg,
        colorClasses.border
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('rounded-lg p-2', colorClasses.iconBg)}>
          {icon}
        </div>
        <h3 className={cn('text-xl font-bold', colorClasses.titleText)}>{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="group">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/50 dark:bg-black/20 text-xs font-bold flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-sm opacity-90">{item.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export const SWOTMatrix: React.FC<SWOTMatrixProps> = ({
  title,
  context,
  strengths,
  weaknesses,
  opportunities,
  threats,
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
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b px-6 py-5"
      >
        <div className="mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            SWOT Analysis
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
        <p className="text-slate-300 text-sm">{context}</p>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* 2x2 Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <QuadrantCard
            title="Strengths"
            items={strengths}
            icon={<Shield className="h-5 w-5" />}
            colorClasses={{
              bg: 'bg-green-50 dark:bg-green-950/30',
              border: 'border-green-400 dark:border-green-600',
              iconBg: 'bg-green-500',
              iconText: 'text-white',
              titleText: 'text-green-800 dark:text-green-200',
            }}
          />

          {/* Weaknesses */}
          <QuadrantCard
            title="Weaknesses"
            items={weaknesses}
            icon={<AlertTriangle className="h-5 w-5" />}
            colorClasses={{
              bg: 'bg-red-50 dark:bg-red-950/30',
              border: 'border-red-400 dark:border-red-600',
              iconBg: 'bg-red-500',
              iconText: 'text-white',
              titleText: 'text-red-800 dark:text-red-200',
            }}
          />

          {/* Opportunities */}
          <QuadrantCard
            title="Opportunities"
            items={opportunities}
            icon={<Target className="h-5 w-5" />}
            colorClasses={{
              bg: 'bg-blue-50 dark:bg-blue-950/30',
              border: 'border-blue-400 dark:border-blue-600',
              iconBg: 'bg-blue-500',
              iconText: 'text-white',
              titleText: 'text-blue-800 dark:text-blue-200',
            }}
          />

          {/* Threats */}
          <QuadrantCard
            title="Threats"
            items={threats}
            icon={<Zap className="h-5 w-5" />}
            colorClasses={{
              bg: 'bg-amber-50 dark:bg-amber-950/30',
              border: 'border-amber-400 dark:border-amber-600',
              iconBg: 'bg-amber-500',
              iconText: 'text-white',
              titleText: 'text-amber-800 dark:text-amber-200',
            }}
          />
        </motion.div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/20 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Strategic Recommendations
            </h3>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{recommendation}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Internal Positive Factors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Internal Negative Factors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>External Positive Factors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>External Negative Factors</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
