'use client';

import * as React from 'react';
import { Users, Workflow, Package, Heart, Radio, DollarSign, Wrench, Zap, HandshakeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BusinessModelCanvasProps {
  businessName: string;
  valuePropositions: string[];
  customerSegments: string[];
  channels: string[];
  customerRelationships: string[];
  revenueStreams: string[];
  keyResources: string[];
  keyActivities: string[];
  keyPartners: string[];
  costStructure: string[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const blockVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

const CanvasBlock: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  colorClasses: {
    bg: string;
    border: string;
    iconBg: string;
    titleText: string;
  };
  className?: string;
}> = ({ title, icon, items, colorClasses, className }) => {
  return (
    <motion.div
      variants={blockVariants}
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-lg p-4 border-2 h-full flex flex-col',
        colorClasses.bg,
        colorClasses.border,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-current/20">
        <div className={cn('rounded p-1', colorClasses.iconBg)}>{icon}</div>
        <h3 className={cn('text-sm font-bold uppercase tracking-wide', colorClasses.titleText)}>{title}</h3>
      </div>
      <ul className="space-y-2 flex-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-current mt-1.5 opacity-60"></span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export const BusinessModelCanvas: React.FC<BusinessModelCanvasProps> = ({
  businessName,
  valuePropositions,
  customerSegments,
  channels,
  customerRelationships,
  revenueStreams,
  keyResources,
  keyActivities,
  keyPartners,
  costStructure,
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
        variants={blockVariants}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b px-6 py-5"
      >
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Business Model Canvas</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{businessName}</h1>
        <p className="text-blue-100 text-sm mt-1">Strategic Business Model Overview</p>
      </motion.div>

      {/* Canvas Grid */}
      <div className="p-6">
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-3">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-3">
            <CanvasBlock
              title="Key Partners"
              icon={<HandshakeIcon className="h-4 w-4" />}
              items={keyPartners}
              colorClasses={{
                bg: 'bg-purple-50 dark:bg-purple-950/30',
                border: 'border-purple-400 dark:border-purple-600',
                iconBg: 'bg-purple-500 text-white',
                titleText: 'text-purple-800 dark:text-purple-200',
              }}
            />
            <CanvasBlock
              title="Key Activities"
              icon={<Zap className="h-4 w-4" />}
              items={keyActivities}
              colorClasses={{
                bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                border: 'border-indigo-400 dark:border-indigo-600',
                iconBg: 'bg-indigo-500 text-white',
                titleText: 'text-indigo-800 dark:text-indigo-200',
              }}
            />
            <CanvasBlock
              title="Key Resources"
              icon={<Wrench className="h-4 w-4" />}
              items={keyResources}
              colorClasses={{
                bg: 'bg-blue-50 dark:bg-blue-950/30',
                border: 'border-blue-400 dark:border-blue-600',
                iconBg: 'bg-blue-500 text-white',
                titleText: 'text-blue-800 dark:text-blue-200',
              }}
            />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-3">
            <CanvasBlock
              title="Value Propositions"
              icon={<Package className="h-4 w-4" />}
              items={valuePropositions}
              colorClasses={{
                bg: 'bg-green-50 dark:bg-green-950/30',
                border: 'border-green-500 dark:border-green-600',
                iconBg: 'bg-green-500 text-white',
                titleText: 'text-green-800 dark:text-green-200',
              }}
              className="lg:row-span-3 min-h-[200px] lg:min-h-0"
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-3">
              <CanvasBlock
                title="Customer Relationships"
                icon={<Heart className="h-4 w-4" />}
                items={customerRelationships}
                colorClasses={{
                  bg: 'bg-pink-50 dark:bg-pink-950/30',
                  border: 'border-pink-400 dark:border-pink-600',
                  iconBg: 'bg-pink-500 text-white',
                  titleText: 'text-pink-800 dark:text-pink-200',
                }}
              />
              <CanvasBlock
                title="Channels"
                icon={<Radio className="h-4 w-4" />}
                items={channels}
                colorClasses={{
                  bg: 'bg-orange-50 dark:bg-orange-950/30',
                  border: 'border-orange-400 dark:border-orange-600',
                  iconBg: 'bg-orange-500 text-white',
                  titleText: 'text-orange-800 dark:text-orange-200',
                }}
              />
            </div>
            <CanvasBlock
              title="Customer Segments"
              icon={<Users className="h-4 w-4" />}
              items={customerSegments}
              colorClasses={{
                bg: 'bg-cyan-50 dark:bg-cyan-950/30',
                border: 'border-cyan-400 dark:border-cyan-600',
                iconBg: 'bg-cyan-500 text-white',
                titleText: 'text-cyan-800 dark:text-cyan-200',
              }}
            />
          </div>

          {/* Bottom Row */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-3">
            <CanvasBlock
              title="Cost Structure"
              icon={<Workflow className="h-4 w-4" />}
              items={costStructure}
              colorClasses={{
                bg: 'bg-red-50 dark:bg-red-950/30',
                border: 'border-red-400 dark:border-red-600',
                iconBg: 'bg-red-500 text-white',
                titleText: 'text-red-800 dark:text-red-200',
              }}
            />
            <CanvasBlock
              title="Revenue Streams"
              icon={<DollarSign className="h-4 w-4" />}
              items={revenueStreams}
              colorClasses={{
                bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                border: 'border-emerald-400 dark:border-emerald-600',
                iconBg: 'bg-emerald-500 text-white',
                titleText: 'text-emerald-800 dark:text-emerald-200',
              }}
            />
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          variants={blockVariants}
          className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400"
        >
          <p className="font-medium mb-2">Business Model Canvas Framework</p>
          <p className="leading-relaxed">
            The Business Model Canvas is a strategic management tool that visualizes the key components of a business
            model. It helps organizations understand, design, and communicate their business model effectively.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
