'use client';

import * as React from 'react';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Projection {
  period: string;
  amount: number;
}

interface RevenueStream {
  name: string;
  projections: Projection[];
}

interface Expense {
  category: string;
  projections: Projection[];
}

interface Metrics {
  grossMargin?: number;
  netMargin?: number;
  burnRate?: number;
  runway?: string;
}

interface FinancialProjectionsProps {
  title: string;
  timeframe: string;
  revenueStreams: RevenueStream[];
  expenses: Expense[];
  assumptions: string[];
  metrics?: Metrics;
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const FinancialProjections: React.FC<FinancialProjectionsProps> = ({
  title,
  timeframe,
  revenueStreams,
  expenses,
  assumptions,
  metrics,
  className,
}) => {
  // Calculate total revenue by period
  const revenueByPeriod = React.useMemo(() => {
    const periodMap = new Map<string, number>();

    revenueStreams.forEach((stream) => {
      stream.projections.forEach((proj) => {
        const current = periodMap.get(proj.period) || 0;
        periodMap.set(proj.period, current + proj.amount);
      });
    });

    return Array.from(periodMap.entries())
      .map(([period, amount]) => ({ period, amount }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [revenueStreams]);

  // Calculate total expenses by period
  const expensesByPeriod = React.useMemo(() => {
    const periodMap = new Map<string, number>();

    expenses.forEach((expense) => {
      expense.projections.forEach((proj) => {
        const current = periodMap.get(proj.period) || 0;
        periodMap.set(proj.period, current + proj.amount);
      });
    });

    return Array.from(periodMap.entries())
      .map(([period, amount]) => ({ period, amount }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [expenses]);

  // Combine for chart
  const chartData = React.useMemo(() => {
    const periods = new Set([...revenueByPeriod.map((r) => r.period), ...expensesByPeriod.map((e) => e.period)]);

    return Array.from(periods)
      .sort()
      .map((period) => ({
        period,
        revenue: revenueByPeriod.find((r) => r.period === period)?.amount || 0,
        expenses: expensesByPeriod.find((e) => e.period === period)?.amount || 0,
        profit: (revenueByPeriod.find((r) => r.period === period)?.amount || 0) -
          (expensesByPeriod.find((e) => e.period === period)?.amount || 0),
      }));
  }, [revenueByPeriod, expensesByPeriod]);

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
        className="bg-gradient-to-r from-green-900 via-emerald-900 to-green-900 border-b px-6 py-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            className="rounded-lg bg-green-500/20 p-2 backdrop-blur"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Calculator className="h-5 w-5 text-green-200" />
          </motion.div>
          <span className="text-xs font-semibold text-green-200 uppercase tracking-wider">
            Financial Projections
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">{title}</h1>
        <p className="text-green-100 text-sm">{timeframe}</p>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        {metrics && (
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.grossMargin !== undefined && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wide mb-1">
                  Gross Margin
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.grossMargin}%</p>
              </div>
            )}
            {metrics.netMargin !== undefined && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">
                  Net Margin
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.netMargin}%</p>
              </div>
            )}
            {metrics.burnRate !== undefined && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide mb-1">
                  Monthly Burn Rate
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(metrics.burnRate)}
                </p>
              </div>
            )}
            {metrics.runway && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wide mb-1">
                  Cash Runway
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.runway}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Revenue vs Expenses vs Profit</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Streams Table */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Revenue Streams
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="bg-green-100 dark:bg-green-900/30">
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100">
                    Revenue Stream
                  </th>
                  {revenueByPeriod.map((item, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-slate-100"
                    >
                      {item.period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueStreams.map((stream, streamIndex) => (
                  <tr
                    key={streamIndex}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{stream.name}</td>
                    {revenueByPeriod.map((periodItem, periodIndex) => {
                      const projection = stream.projections.find((p) => p.period === periodItem.period);
                      return (
                        <td key={periodIndex} className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">
                          {projection ? formatCurrency(projection.amount) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Expenses Table */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            Expenses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="bg-red-100 dark:bg-red-900/30">
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100">
                    Expense Category
                  </th>
                  {expensesByPeriod.map((item, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-slate-100"
                    >
                      {item.period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, expenseIndex) => (
                  <tr
                    key={expenseIndex}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {expense.category}
                    </td>
                    {expensesByPeriod.map((periodItem, periodIndex) => {
                      const projection = expense.projections.find((p) => p.period === periodItem.period);
                      return (
                        <td key={periodIndex} className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">
                          {projection ? formatCurrency(projection.amount) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Assumptions */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Key Assumptions</h2>
          <ul className="space-y-2">
            {assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};
