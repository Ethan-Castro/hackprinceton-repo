"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartToolOutput } from "@/lib/chart-tools";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
];

export function ChartRenderer({ data }: { data: ChartToolOutput }) {
  const {
    title,
    description,
    chartType,
    data: chartData,
    config,
    xAxisKey,
    yAxisKeys,
    width = 600,
    height = 400,
  } = data;

  const getConfigColor = (key: string, index: number) => {
    return config[key]?.color || COLORS[index % COLORS.length];
  };

  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {Object.entries(config).map(([key], index) => (
                  <linearGradient
                    key={key}
                    id={`gradient-${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={getConfigColor(key, index)}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={getConfigColor(key, index)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey || Object.keys(chartData[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.entries(config).map(([key, value], index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={getConfigColor(key, index)}
                  fill={`url(#gradient-${key})`}
                  fillOpacity={0.3}
                  name={value.label}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey || Object.keys(chartData[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.entries(config).map(([key, value], index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={getConfigColor(key, index)}
                  strokeWidth={2}
                  name={value.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey || Object.keys(chartData[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.entries(config).map(([key, value], index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={getConfigColor(key, index)}
                  name={value.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie": {
        const pieData = chartData.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length],
        }));

        const dataKey = Object.keys(config)[0] || Object.keys(chartData[0])[1];
        const labelKey = Object.keys(chartData[0])[0];

        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey={dataKey}
                nameKey={labelKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxisKey || Object.keys(chartData[0])[0]}
                type="number"
              />
              <YAxis
                dataKey={
                  yAxisKeys?.[0] || Object.keys(chartData[0])[1]
                }
                type="number"
              />
              <Tooltip />
              <Legend />
              {Object.entries(config).map(([key, value], index) => (
                <Scatter
                  key={key}
                  name={value.label}
                  data={chartData}
                  fill={getConfigColor(key, index)}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <div style={{ minWidth: width }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}
