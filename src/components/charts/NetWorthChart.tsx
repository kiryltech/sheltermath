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
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

// Tooltip component definition moved outside render
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formatCurrency = (value: number) => {
      if (Math.abs(value) >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`;
      }
      return `$${value.toFixed(0)}`;
    };

    return (
      <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs z-50">
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

export const NetWorthChart = () => {
  const { results } = useSimulationStore();
  const { annualData } = results;

  // Format currency for axis
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-sm font-semibold text-white">Net Worth Projection</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Accumulated wealth over time (Property Equity vs. Portfolio Value)</p>
            </div>
             {/* Custom Legend to match design */}
            <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-buy"></div>
                    <span className="text-zinc-300">Buying</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-rent"></div>
                    <span className="text-zinc-300">Renting</span>
                </div>
            </div>
        </div>

        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={annualData}
                margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                    dataKey="year"
                    stroke="#71717a"
                    tick={{fill: '#52525b', fontSize: 10, fontFamily: 'monospace'}}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `Year ${val}`}
                    interval="preserveStartEnd"
                />
                <YAxis
                    stroke="#71717a"
                    tick={{fill: '#52525b', fontSize: 10, fontFamily: 'monospace'}}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />

                <Line
                type="monotone"
                dataKey="ownerNetWorth"
                name="Buying"
                stroke="#f97316" // orange-500
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Line
                type="monotone"
                dataKey="renterNetWorth"
                name="Renting"
                stroke="#22d3ee" // cyan-400
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
    </>
  );
};
