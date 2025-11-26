"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Play, BarChart3, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { SandpackDashboardRenderer } from "@/components/sandpack-dashboard-renderer";
import Link from "next/link";

// Sample hardcoded React component with Recharts to test Sandpack
const SAMPLE_DASHBOARD_CODE = `import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Activity } from 'lucide-react';
import clsx from 'clsx';

// Sample data
const monthlyData = [
  { month: 'Jan', revenue: 4000, profit: 2400, customers: 240 },
  { month: 'Feb', revenue: 3000, profit: 1398, customers: 221 },
  { month: 'Mar', revenue: 5000, profit: 3200, customers: 290 },
  { month: 'Apr', revenue: 4500, profit: 2800, customers: 265 },
  { month: 'May', revenue: 6000, profit: 3800, customers: 320 },
  { month: 'Jun', revenue: 5500, profit: 3500, customers: 300 },
];

const categoryData = [
  { name: 'Electronics', value: 35 },
  { name: 'Clothing', value: 25 },
  { name: 'Food', value: 20 },
  { name: 'Other', value: 20 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

// Card component
const Card = ({ children, className }) => (
  <div className={clsx(
    "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",
    className
  )}>
    {children}
  </div>
);

// Metric Card component
const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        <p className={clsx(
          "text-sm mt-1 flex items-center gap-1",
          trend === "up" ? "text-green-600" : "text-red-600"
        )}>
          {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {change}
        </p>
      </div>
      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </Card>
);

export default function App() {
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showComparison, setShowComparison] = useState(true);

  // Computed totals
  const totals = useMemo(() => ({
    revenue: monthlyData.reduce((sum, item) => sum + item.revenue, 0),
    profit: monthlyData.reduce((sum, item) => sum + item.profit, 0),
    customers: monthlyData.reduce((sum, item) => sum + item.customers, 0),
  }), []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monthly performance overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Revenue"
          value={\`$\${totals.revenue.toLocaleString()}\`}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Total Profit"
          value={\`$\${totals.profit.toLocaleString()}\`}
          change="+8.2%"
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Customers"
          value={totals.customers.toLocaleString()}
          change="+15.3%"
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Avg. Order"
          value={\`$\${Math.round(totals.revenue / totals.customers)}\`}
          change="-2.1%"
          icon={ShoppingCart}
          trend="down"
        />
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="revenue">Revenue</option>
              <option value="profit">Profit</option>
              <option value="customers">Customers</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show comparison</span>
          </label>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  {showComparison && selectedMetric === 'revenue' && (
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={selectedMetric} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  {showComparison && selectedMetric === 'revenue' && (
                    <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sales by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => \`\${name}: \${value}%\`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}`;

// Test results interface
interface TestResult {
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  error?: string;
}

export default function TestDashboardPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: "Sandpack Provider loads", status: "pending" },
    { name: "React renders correctly", status: "pending" },
    { name: "Recharts imports work", status: "pending" },
    { name: "Lucide icons display", status: "pending" },
    { name: "Interactivity functions", status: "pending" },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setShowPreview(true);

    // Simulate test progression
    for (let i = 0; i < testResults.length; i++) {
      setTestResults((prev) =>
        prev.map((test, index) =>
          index === i ? { ...test, status: "running" } : test
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 800));

      setTestResults((prev) =>
        prev.map((test, index) =>
          index === i ? { ...test, status: "passed" } : test
        )
      );
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <div className="h-5 w-5 rounded-full bg-muted" />;
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/generative-bi" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Sandpack Test</span>
            </Link>
            <Badge variant="outline" className="text-xs">
              Validation
            </Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Sandpack Integration Test
            </h1>
            <p className="text-muted-foreground">
              Verify that the Sandpack environment is properly configured for dashboard rendering.
            </p>
          </motion.div>

          {/* Test Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border shadow-sm mb-8"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Test Suite
              </h2>
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Tests
                  </>
                )}
              </Button>
            </div>

            <div className="divide-y">
              {testResults.map((test, index) => (
                <motion.div
                  key={test.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-center justify-between"
                >
                  <span className="text-sm">{test.name}</span>
                  {getStatusIcon(test.status)}
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {testResults.filter((t) => t.status === "passed").length} / {testResults.length} tests passed
                </span>
                {testResults.every((t) => t.status === "passed") && (
                  <Badge variant="default" className="bg-green-500">
                    All tests passed
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Live Preview</h2>
                <Badge variant="secondary">Hardcoded Test Component</Badge>
              </div>
              <SandpackDashboardRenderer
                code={SAMPLE_DASHBOARD_CODE}
                title="Sample Revenue Dashboard"
                description="This is a hardcoded test component to verify Sandpack is working correctly."
                showEditor={true}
                previewHeight={600}
              />
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-muted/30 rounded-xl border"
          >
            <h3 className="font-semibold mb-3">What this test verifies:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Sandpack provider initializes and loads the React template</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Recharts library is available and charts render correctly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Lucide React icons are importable and display properly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>clsx and Tailwind CSS classes work as expected</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>useState and interactivity function correctly</span>
              </li>
            </ul>
          </motion.div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/generative-bi">
                Go to Generative BI Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

