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
    // Helper to find value by dataKey
    const getValue = (key: string) => payload.find((p: any) => p.dataKey === key)?.value || 0;

    const carPayment = getValue('carPayment');
    const carInsurance = getValue('carInsurance');
    const food = getValue('food');
    const utilities = getValue('utilities');
    const dineOut = getValue('dineOut');
    const totalExpenses = carPayment + carInsurance + food + utilities + dineOut;

    const ownerBudget = getValue('ownerBudget');
    const renterBudget = getValue('renterBudget');

    const ownerDiscretionary = ownerBudget - totalExpenses;
    const renterDiscretionary = renterBudget - totalExpenses;

    const format = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

    return (
      <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md min-w-[220px]">
        <p className="text-zinc-400 text-xs mb-2">Year {label}</p>

        {/* Expenses Group */}
        <div className="mb-3 pb-3 border-b border-white/5 space-y-1">
             <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Expenses</div>
             <div className="flex justify-between text-sm"><span style={{color: '#ef4444'}}>Car Payment:</span> <span className="text-white font-mono">{format(carPayment)}</span></div>
             <div className="flex justify-between text-sm"><span style={{color: '#eab308'}}>Insurance & Gas:</span> <span className="text-white font-mono">{format(carInsurance)}</span></div>
             <div className="flex justify-between text-sm"><span style={{color: '#10b981'}}>Food & Essentials:</span> <span className="text-white font-mono">{format(food)}</span></div>
             <div className="flex justify-between text-sm"><span style={{color: '#a855f7'}}>Dining Out:</span> <span className="text-white font-mono">{format(dineOut)}</span></div>
             <div className="flex justify-between text-sm"><span style={{color: '#6366f1'}}>Utilities:</span> <span className="text-white font-mono">{format(utilities)}</span></div>
             <div className="flex justify-between text-sm pt-1 border-t border-white/5 font-bold"><span className="text-zinc-300">Total Expenses:</span> <span className="text-white font-mono">{format(totalExpenses)}</span></div>
        </div>

        {/* Budgets Group */}
        <div className="space-y-3">
            <div>
                 <div className="flex justify-between text-sm font-bold" style={{color: '#f97316'}}>
                    <span>Owner Budget:</span>
                    <span className="font-mono">{format(ownerBudget)}</span>
                 </div>
                 <div className="flex justify-between text-xs text-zinc-400 pl-2">
                    <span>Remaining:</span>
                    <span className={ownerDiscretionary < 0 ? 'text-red-400 font-mono' : 'text-green-400 font-mono'}>{format(ownerDiscretionary)}</span>
                 </div>
            </div>
            <div>
                 <div className="flex justify-between text-sm font-bold" style={{color: '#22d3ee'}}>
                    <span>Renter Budget:</span>
                    <span className="font-mono">{format(renterBudget)}</span>
                 </div>
                 <div className="flex justify-between text-xs text-zinc-400 pl-2">
                    <span>Remaining:</span>
                    <span className={renterDiscretionary < 0 ? 'text-red-400 font-mono' : 'text-green-400 font-mono'}>{format(renterDiscretionary)}</span>
                 </div>
            </div>
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
            ownerBudget: d.lifestyleBudgetOwner,
            renterBudget: d.lifestyleBudgetRenter,
            carPayment: d.carPayment,
            carInsurance: d.carInsuranceGasMaintenance,
            food: d.foodAndEssentials,
            utilities: d.utilities,
            dineOut: d.dineOut
        });
    }
    return sampled;
  }, [results]);

  return (
    <div className="bg-surface-dark border border-white/5 rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-zinc-500">account_balance_wallet</span>
            Lifestyle Breakdown
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Comparison of total monthly budget (Net Income - Housing Costs) against projected lifestyle expenses.
          The solid area represents unavoidable expenses; the lines show total available budget.
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
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

            {/* Stacked Expenses */}
            <Area
              type="monotone"
              dataKey="utilities"
              stackId="expenses"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
              name="Utilities"
            />
             <Area
              type="monotone"
              dataKey="dineOut"
              stackId="expenses"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.6}
              name="Dining Out"
            />
            <Area
              type="monotone"
              dataKey="food"
              stackId="expenses"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Food & Essentials"
            />
             <Area
              type="monotone"
              dataKey="carInsurance"
              stackId="expenses"
              stroke="#eab308"
              fill="#eab308"
              fillOpacity={0.6}
              name="Car Ins & Gas"
            />
            <Area
              type="monotone"
              dataKey="carPayment"
              stackId="expenses"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
              name="Car Payment"
            />

            {/* Budget Lines (Transparent Areas) */}
            <Area
              type="monotone"
              dataKey="ownerBudget"
              stroke="#f97316"
              strokeWidth={3}
              fill="none"
              name="Available (Owner)"
            />
            <Area
              type="monotone"
              dataKey="renterBudget"
              stroke="#22d3ee"
              strokeWidth={3}
              fill="none"
              name="Available (Renter)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
