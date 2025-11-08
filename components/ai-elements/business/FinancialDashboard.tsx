'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface KPI {
  name: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
}

interface ChartData {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Array<{
    label: string;
    value: number;
  }>;
  description?: string;
}

interface FinancialDashboardProps {
  title: string;
  period: string;
  kpis: KPI[];
  charts: ChartData[];
  insights?: string[];
  className?: string;
}

// Professional color palette for business
const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#f59e0b', '#10b981'];

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

const TrendIcon: React.FC<{ trend?: 'up' | 'down' | 'flat' }> = ({ trend }) => {
  if (trend === 'up') {
    return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
  }
  if (trend === 'down') {
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  }
  return <Minus className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
};

const ChartComponent: React.FC<{ chart: ChartData }> = ({ chart }) => {
  const chartData = chart.data.map(item => ({
    name: item.label,
    value: item.value,
  }));

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} dot={{ fill: '#1e40af', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#1e40af" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: { name?: string; percent?: number }) => {
                  const name = props.name || '';
                  const percent = props.percent || 0;
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{chart.title}</h3>
      {chart.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{chart.description}</p>
      )}
      <div className="mt-4">{renderChart()}</div>
    </motion.div>
  );
};

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  title,
  period,
  kpis,
  charts,
  insights,
  className,
}) => {
  const exportData = () => {
    const data = {
      title,
      period,
      kpis,
      charts,
      insights,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_Dashboard_Data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b px-6 py-5"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <motion.div
              className="rounded-lg bg-blue-500/20 p-2 backdrop-blur"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <LineChartIcon className="h-5 w-5 text-blue-200" />
            </motion.div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Financial Dashboard
            </span>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-100 hover:text-white hover:bg-blue-800/50 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-blue-100 text-sm mt-1">{period}</p>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* KPIs Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">
                  {kpi.name}
                </p>
                {kpi.trend && <TrendIcon trend={kpi.trend} />}
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{kpi.value}</p>
              {kpi.change && (
                <p
                  className={cn(
                    'text-xs font-medium',
                    kpi.trend === 'up' && 'text-green-600 dark:text-green-400',
                    kpi.trend === 'down' && 'text-red-600 dark:text-red-400',
                    !kpi.trend && 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {kpi.change}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <ChartComponent key={index} chart={chart} />
          ))}
        </motion.div>

        {/* Insights */}
        {insights && insights.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
          >
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Key Insights</h3>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{insight}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
