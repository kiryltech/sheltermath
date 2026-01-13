"use client";

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export const SummaryMetrics = () => {
  const { results, inputs } = useSimulationStore();
  const { summary, crossoverDate, monthlyPaymentCrossoverDate } = results;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatDuration = (totalMonths: number) => {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const parts = [];
    if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
    if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);

    if (parts.length === 0) return "Immediate";
    return parts.join(', ');
  };

  const netWorthDiff = summary.finalOwnerNetWorth - summary.finalRenterNetWorth;
  const isBuyingBetter = netWorthDiff > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">

      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h4 className="text-zinc-400 text-sm font-medium mb-1">Equity Crossover</h4>
        <div className="text-2xl font-bold text-white">
          {crossoverDate ? formatDuration(crossoverDate.totalMonths) : "Never"}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
            When buying becomes wealthier than renting
        </p>
      </div>

      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h4 className="text-zinc-400 text-sm font-medium mb-1">Monthly Payment Crossover</h4>
        <div className="text-2xl font-bold text-white">
          {monthlyPaymentCrossoverDate ? formatDuration(monthlyPaymentCrossoverDate.totalMonths) : "Never"}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
            When monthly ownership costs become less than renting
        </p>
      </div>

      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h4 className="text-zinc-400 text-sm font-medium mb-1">Net Worth Diff (Year {inputs.simulationYears})</h4>
        <div className={`text-2xl font-bold ${isBuyingBetter ? 'text-green-400' : 'text-red-400'}`}>
          {isBuyingBetter ? "+" : ""}{formatCurrency(netWorthDiff)}
        </div>
         <p className="text-xs text-zinc-500 mt-2">
            {isBuyingBetter ? "Buying Advantage" : "Renting Advantage"}
        </p>
      </div>

      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h4 className="text-zinc-400 text-sm font-medium mb-1">Total Interest Paid</h4>
        <div className="text-2xl font-bold text-white">
          {formatCurrency(summary.totalInterestPaid)}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
            Over {inputs.simulationYears} years
        </p>
      </div>

    </div>
  );
};
