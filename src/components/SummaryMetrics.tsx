"use client";

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export const SummaryMetrics = () => {
  const { results, inputs } = useSimulationStore();
  const { summary, crossoverDate } = results;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const netWorthDiff = summary.finalOwnerNetWorth - summary.finalRenterNetWorth;
  const isBuyingBetter = netWorthDiff > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">

      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <h4 className="text-zinc-400 text-sm font-medium mb-1">Crossover Point</h4>
        <div className="text-2xl font-bold text-white">
          {crossoverDate ? `Year ${crossoverDate.year}, Month ${crossoverDate.month}` : "Never"}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
            When buying becomes wealthier than renting
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
