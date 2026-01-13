"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export const AnnualBreakdownCharts = () => {
  const { results } = useSimulationStore();
  const { annualFlows } = results;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs">
          <p className="font-bold text-zinc-300 mb-1">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                 <span className="text-zinc-400">{entry.name}:</span>
                 <span className="text-zinc-200 font-mono">{formatCurrency(entry.value)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-zinc-800">
             <span className="text-zinc-400">Total: </span>
             <span className="text-zinc-200 font-mono">
                 {formatCurrency(payload.reduce((acc: number, curr: any) => acc + curr.value, 0))}
             </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
        {/* Renter Chart */}
        <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Renter Annual Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={annualFlows}
                margin={{
                  top: 20,
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.2 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />

                <Bar dataKey="renterRent" stackId="a" name="Rent" fill="#22d3ee" />
                <Bar dataKey="renterInsurance" stackId="a" name="Insurance" fill="#06b6d4" />
                <Bar dataKey="renterPortfolioContribution" stackId="a" name="Portfolio Contribution" fill="#3b82f6" />
                <Bar dataKey="renterPortfolioGrowth" stackId="a" name="Portfolio Growth" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Owner Chart */}
        <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Owner Annual Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={annualFlows}
                margin={{
                  top: 20,
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.2 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />

                {/* Expenses */}
                <Bar dataKey="ownerInterestPaid" stackId="a" name="Mortgage Interest" fill="#ef4444" />
                <Bar dataKey="ownerTax" stackId="a" name="Property Tax" fill="#f59e0b" />
                <Bar dataKey="ownerMaintenance" stackId="a" name="Maintenance" fill="#eab308" />
                <Bar dataKey="ownerInsurance" stackId="a" name="Home Insurance" fill="#f97316" />

                {/* Wealth Accumulation */}
                <Bar dataKey="ownerPrincipalPaid" stackId="a" name="Principal Paid" fill="#8b5cf6" />
                <Bar dataKey="ownerPortfolioContribution" stackId="a" name="Portfolio Contribution" fill="#3b82f6" />
                <Bar dataKey="ownerPortfolioGrowth" stackId="a" name="Portfolio Growth" fill="#06b6d4" />
                <Bar dataKey="ownerHomeAppreciation" stackId="a" name="Home Appreciation" fill="#10b981" />

              </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
