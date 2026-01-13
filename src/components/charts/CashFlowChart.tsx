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
        const year = payload[0].payload.year;
      return (
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-zinc-400 text-xs mb-2">Year {year}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-zinc-300 w-24">{entry.name}:</span>
                  <span className="font-mono text-white">
                    {formatCurrency(entry.value)}/mo
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
                <span className="material-symbols-outlined text-zinc-500">payments</span>
                Monthly Cash Flow
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Monthly cash outflows for housing (Mortgage/Rent + Taxes + Maintenance + Insurance).
            </p>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
                <defs>
                    <linearGradient id="colorFlowBuy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFlowRent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                </defs>
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
                <Area
                    type="monotone"
                    dataKey="totalOwnerOutflow"
                    name="Owner"
                    stroke="#f97316"
                    fill="url(#colorFlowBuy)"
                    strokeWidth={2}
                    fillOpacity={1}
                />
                <Area
                    type="monotone"
                    dataKey="totalRenterOutflow"
                    name="Renter"
                    stroke="#22d3ee"
                    fill="url(#colorFlowRent)"
                    strokeWidth={2}
                    fillOpacity={1}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
