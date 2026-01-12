"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export const NetWorthChart = () => {
  const { results } = useSimulationStore();
  const { annualData } = results;

  // Format currency for axis and tooltip
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs">
          <p className="font-bold text-zinc-300 mb-1">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Net Worth Projection</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={annualData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
                dataKey="year"
                stroke="#71717a"
                tick={{fill: '#71717a', fontSize: 12}}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke="#71717a"
                tick={{fill: '#71717a', fontSize: 12}}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line
              type="monotone"
              dataKey="ownerNetWorth"
              name="Buying Net Worth"
              stroke="#f97316" // orange-500
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="renterNetWorth"
              name="Renting Net Worth"
              stroke="#22d3ee" // cyan-400
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
};
