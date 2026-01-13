"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-zinc-400 text-xs mb-2">Year {label}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-300 w-24">{entry.name}:</span>
              <span className="font-mono text-white">
                {entry.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const HousingIncomeRatioChart = () => {
  const { results } = useSimulationStore();

  const data = useMemo(() => {
    // Aggregate monthly data to annual for smoother chart, or just use every 12th month
    // Using monthly data might be too noisy if plotted directly, but Area chart handles it well.
    // Let's sample yearly to match other charts.
    const sampled = [];
    for (let i = 0; i < results.monthlyData.length; i += 12) {
        const d = results.monthlyData[i];
        sampled.push({
            year: d.year,
            Owner: d.housingIncomeRatioOwner,
            Renter: d.housingIncomeRatioRenter,
        });
    }
    return sampled;
  }, [results]);

  return (
    <div className="bg-surface-dark border border-white/5 rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-zinc-500">pie_chart</span>
            Housing Cost % of Gross Income
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Percentage of monthly gross income spent on housing costs (Owner vs Renter).
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorRatioBuy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRatioRent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="Owner"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRatioBuy)"
              name="Owner"
            />
            <Area
              type="monotone"
              dataKey="Renter"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRatioRent)"
              name="Renter"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
