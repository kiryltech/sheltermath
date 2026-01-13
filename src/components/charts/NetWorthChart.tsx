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
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-zinc-400 text-xs mb-2">Year {label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                 <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-zinc-300 w-24">{entry.name}:</span>
                  <span className="font-mono text-white">
                    {formatCurrency(entry.value)}
                  </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-dark border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-zinc-500">trending_up</span>
                Net Worth Projection
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Total value of assets (Home Equity + Investments) minus liabilities (Mortgage Balance) over time.
            </p>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={annualData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="year"
                    stroke="#52525b"
                    tick={{fill: '#71717a', fontSize: 12}}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#52525b"
                    tick={{fill: '#71717a', fontSize: 12}}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                    type="monotone"
                    dataKey="ownerNetWorth"
                    name="Owner"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="renterNetWorth"
                    name="Renter"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
