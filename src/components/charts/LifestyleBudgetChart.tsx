"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

const formatCurrency = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
};

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
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const LifestyleBudgetChart = () => {
  const { results } = useSimulationStore();

  const data = useMemo(() => {
    // Sampling annually
    const sampled = [];
    for (let i = 0; i < results.monthlyData.length; i += 12) {
        const d = results.monthlyData[i];
        sampled.push({
            year: d.year,
            Owner: d.lifestyleBudgetOwner,
            Renter: d.lifestyleBudgetRenter,
        });
    }
    return sampled;
  }, [results]);

  return (
    <div className="bg-surface-dark border border-white/5 rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-zinc-500">account_balance_wallet</span>
            Monthly Lifestyle Budget
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Monthly income remaining after taxes and housing costs. This covers all essentials including food, transportation, student loans, etc.
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorBudgetBuy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBudgetRent" x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="Owner"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBudgetBuy)"
              name="Owner"
            />
            <Area
              type="monotone"
              dataKey="Renter"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBudgetRent)"
              name="Renter"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
