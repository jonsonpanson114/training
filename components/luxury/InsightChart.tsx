'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

type ChartDataPoint = Record<string, string | number | undefined>;

interface InsightChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie';
  dataKey: string;
  nameKey?: string;
  color?: string;
}

const COLORS = ['#d4af37', '#C0C0C0', '#CD7F32', '#996515', '#B8860B'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: string | number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="vintage-card p-3 shadow-xl border-accent/20 bg-background/90 backdrop-blur-sm">
        <p className="text-xs font-serif font-bold text-accent mb-1">{label || payload[0].name}</p>
        <p className="text-sm font-medium">
          {payload[0].name ? `${payload[0].name}: ` : ''}
          <span className="text-primary">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export function InsightChart({ data, type, dataKey, nameKey, color = '#d4af37' }: InsightChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
        データが不足しています
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'currentColor', opacity: 0.6 }}
            />
            <YAxis 
              stroke="#888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'currentColor', opacity: 0.6 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'currentColor', opacity: 0.6 }}
            />
            <YAxis 
              stroke="#888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'currentColor', opacity: 0.6 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={dataKey}
              nameKey={nameKey || 'name'}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
