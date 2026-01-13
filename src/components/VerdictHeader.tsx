"use client";

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export const VerdictHeader = () => {
  const { results, inputs } = useSimulationStore();
  const { summary, crossoverDate } = results;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
      return `$${value}`;
  }

  const netWorthDiff = summary.finalOwnerNetWorth - summary.finalRenterNetWorth;
  const isBuyingBetter = netWorthDiff > 0;

  // Calculate unrecoverable costs (approximate for the card visualization)
  // For the purpose of the card, we might want the Total Interest + Tax + Maint vs Total Rent
  // This data is available in the summary or can be aggregated.
  // The summary has totalInterestPaid. We can iterate monthlyData to get others if needed.
  // Let's iterate quickly or update the engine to provide it.
  // Actually, let's just use what we have or summing up from monthlyData on the fly is cheap enough for 30 years.

  let totalOwnerUnrecoverable = 0;
  let totalRenterUnrecoverable = 0;

  results.monthlyData.forEach(m => {
      totalOwnerUnrecoverable += m.totalOwnerCosts; // Interest + Tax + Maint + Insurance
      totalRenterUnrecoverable += m.totalRenterOutflow; // Rent + Insurance
  });


  return (
    <header className="h-auto border-b border-white/5 bg-background-dark/80 backdrop-blur px-6 py-4 flex flex-col gap-4 z-10 rounded-xl mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            The Verdict
            <span className="px-2 py-0.5 rounded-full bg-surface-highlight text-[10px] text-zinc-400 font-mono border border-white/5 uppercase tracking-wide">
              {inputs.simulationYears} Year Outlook
            </span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Comparing total financial outcome of buying this property vs. renting and investing the difference.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Segmented Control - Visual Only for now as per plan, but could update simulationYears */}
          <div className="bg-surface-dark p-1 rounded-lg flex border border-white/5">
             {/* Note: Changing years here would require updating the store. For now, just a visual element to match design as requested */}
            <button className="px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors">10Y</button>
            <button className="px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors">20Y</button>
            <button className="px-3 py-1 text-xs font-medium text-white bg-white/10 rounded shadow-sm">30Y</button>
          </div>
          {/* Primary Action */}
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_-3px_rgba(80,72,229,0.3)]">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            AI Analysis
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {/* Card 1: Crossover */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-lg p-3 flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-crossover/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider z-10">Crossover Point</span>
          <div className="flex items-baseline gap-2 mt-1 z-10">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {crossoverDate ? `Year ${crossoverDate.year}` : "Never"}
            </span>
            {crossoverDate && (
                <span className="text-xs text-crossover font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Breakeven
                </span>
            )}
          </div>
        </div>

        {/* Card 2: Net Worth Delta */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-lg p-3 flex flex-col relative overflow-hidden">
          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Net Worth Delta</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${isBuyingBetter ? 'text-buy' : 'text-rent'}`}>
                {isBuyingBetter ? "+" : ""}{formatCurrency(netWorthDiff)}
            </span>
            <span className="text-xs text-zinc-400">
                {isBuyingBetter ? "Favoring Buy" : "Favoring Rent"}
            </span>
          </div>
        </div>

        {/* Card 3: Unrecoverable Costs */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-lg p-3 flex flex-col relative overflow-hidden">
          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Unrecoverable Costs</span>
          <div className="mt-1 flex gap-4 text-xs font-mono tabular-nums">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-buy"></div>
              <span className="text-zinc-300">{formatCompactCurrency(totalOwnerUnrecoverable)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rent"></div>
              <span className="text-zinc-300">{formatCompactCurrency(totalRenterUnrecoverable)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
