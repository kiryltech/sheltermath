"use client";

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export const AnnualBreakdownCharts = () => {
  const { results } = useSimulationStore();
  const { annualFlows } = results;

  const chartData = useMemo(() => {
    return annualFlows.map(flow => ({
        ...flow,
        // Negative Flows (Expenses & Outflows)
        renterRentNeg: -flow.renterRent,
        renterInsuranceNeg: -flow.renterInsurance,
        renterPortfolioContributionNeg: -flow.renterPortfolioContribution,

        ownerInterestNeg: -flow.ownerInterestPaid,
        ownerTaxNeg: -flow.ownerTax,
        ownerMaintenanceNeg: -flow.ownerMaintenance,
        ownerInsuranceNeg: -flow.ownerInsurance,
        ownerPrincipalNeg: -flow.ownerPrincipalPaid,
        ownerPortfolioContributionNeg: -flow.ownerPortfolioContribution,
    }));
  }, [annualFlows]);

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000) {
        return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(0)}k`;
    }
    return `${value < 0 ? '-' : ''}$${absValue.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Separate positive and negative items
        const income = payload.filter((p: any) => p.value > 0);
        const expenses = payload.filter((p: any) => p.value < 0);

        // Calculate Net
        const total = payload.reduce((acc: number, curr: any) => acc + curr.value, 0);

      return (
        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs min-w-[200px]">
          <p className="font-bold text-zinc-300 mb-2">Year {label}</p>

          {income.length > 0 && (
              <div className="mb-2">
                  <p className="text-zinc-500 font-semibold mb-1 uppercase text-[10px]">Asset Growth & Inflow</p>
                  {income.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-0.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-zinc-400">{entry.name}</span>
                        </div>
                        <span className="text-zinc-200 font-mono">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
              </div>
          )}

          {expenses.length > 0 && (
              <div className="mb-2">
                  <p className="text-zinc-500 font-semibold mb-1 uppercase text-[10px]">Expenses & Outflow</p>
                  {expenses.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-0.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-zinc-400">{entry.name}</span>
                        </div>
                        <span className="text-zinc-200 font-mono">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
              </div>
          )}

          <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between">
             <span className="text-zinc-400 font-semibold">Net Flow: </span>
             <span className={`font-mono ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                 {formatCurrency(total)}
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
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
                stackOffset="sign"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                    dataKey="year"
                    stroke="#71717a"
                    tick={{fill: '#71717a', fontSize: 12}}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                />
                <YAxis
                    stroke="#71717a"
                    tick={{fill: '#71717a', fontSize: 12}}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.2 }} />
                <ReferenceLine y={0} stroke="#52525b" />

                {/* Positive Stack */}
                <Bar dataKey="renterPortfolioContribution" stackId="a" name="Portfolio Contribution (In)" fill="#3b82f6" stroke="none" />
                <Bar dataKey="renterPortfolioGrowth" stackId="a" name="Portfolio Growth" fill="#10b981" stroke="none" />

                {/* Negative Stack */}
                <Bar dataKey="renterRentNeg" stackId="a" name="Rent" fill="#ef4444" stroke="none" />
                <Bar dataKey="renterInsuranceNeg" stackId="a" name="Insurance" fill="#f97316" stroke="none" />
                <Bar dataKey="renterPortfolioContributionNeg" stackId="a" name="Portfolio Contribution (Out)" fill="#60a5fa" stroke="none" />
              </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Owner Chart */}
        <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Owner Annual Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
                stackOffset="sign"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                    dataKey="year"
                    stroke="#71717a"
                    tick={{fill: '#71717a', fontSize: 12}}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                />
                <YAxis
                    stroke="#71717a"
                    tick={{fill: '#71717a', fontSize: 12}}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.2 }} />
                <ReferenceLine y={0} stroke="#52525b" />

                {/* Positive Stack */}
                <Bar dataKey="ownerPrincipalPaid" stackId="a" name="Principal Paid (In)" fill="#8b5cf6" stroke="none" />
                <Bar dataKey="ownerPortfolioContribution" stackId="a" name="Portfolio Contribution (In)" fill="#3b82f6" stroke="none" />
                <Bar dataKey="ownerHomeAppreciation" stackId="a" name="Home Appreciation" fill="#10b981" stroke="none" />
                <Bar dataKey="ownerPortfolioGrowth" stackId="a" name="Portfolio Growth" fill="#06b6d4" stroke="none" />

                {/* Negative Stack */}
                <Bar dataKey="ownerInterestNeg" stackId="a" name="Mortgage Interest" fill="#ef4444" stroke="none" />
                <Bar dataKey="ownerTaxNeg" stackId="a" name="Property Tax" fill="#f59e0b" stroke="none" />
                <Bar dataKey="ownerMaintenanceNeg" stackId="a" name="Maintenance" fill="#eab308" stroke="none" />
                <Bar dataKey="ownerInsuranceNeg" stackId="a" name="Home Insurance" fill="#f97316" stroke="none" />
                <Bar dataKey="ownerPrincipalNeg" stackId="a" name="Principal Paid (Out)" fill="#a78bfa" stroke="none" />
                <Bar dataKey="ownerPortfolioContributionNeg" stackId="a" name="Portfolio Contribution (Out)" fill="#60a5fa" stroke="none" />

              </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
