"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export const CashFlowChart = () => {
  const { results } = useSimulationStore();
  const { monthlyData } = results;

  // Sample annually for cleaner chart (every 12th data point)
  const data = monthlyData.filter((_, index) => index % 12 === 0);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // payload[0].payload is the data object
        const year = payload[0].payload.year;
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs">
          <p className="font-bold text-zinc-300 mb-1">Year {year}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}/mo
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Monthly Cash Flow</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
            <Area
              type="monotone"
              dataKey="totalOwnerOutflow"
              name="Buying Monthly Cost"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.1}
              strokeWidth={2}
            />
             <Area
              type="monotone"
              dataKey="totalRenterOutflow"
              name="Renting Monthly Cost"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};
