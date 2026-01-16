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
  Legend
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

export const AnnualBreakdownCharts = () => {
  const { results } = useSimulationStore();
  const { annualFlows } = results;

  const chartData = useMemo(() => {
    return annualFlows.map(flow => ({
        ...flow,
    }));
  }, [annualFlows]);

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000) {
        return `$${(absValue / 1000).toFixed(0)}k`;
    }
    return `$${absValue.toFixed(0)}`;
  };

const OUTFLOW_NAMES = ['Rent', 'Insurance', 'Mortgage Interest', 'Property Tax', 'Maintenance', 'Home Insurance', 'PMI'];
const INFLOW_NAMES = ['Home Appreciation', 'Portfolio Growth', 'Tax Savings'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const outflows = payload.filter((p: any) => p.dataKey && p.value > 0 && (
            p.name.includes('(Out)') || OUTFLOW_NAMES.includes(p.name)
        ));

        const inflows = payload.filter((p: any) => p.dataKey && p.value > 0 && (
             p.name.includes('(In)') || INFLOW_NAMES.includes(p.name)
        ));

        const totalOutflow = outflows.reduce((acc: number, curr: any) => acc + curr.value, 0);
        const totalInflow = inflows.reduce((acc: number, curr: any) => acc + curr.value, 0);

      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded shadow-lg text-xs min-w-[220px]">
          <p className="font-bold text-zinc-300 mb-3 text-sm">Year {label}</p>

          <div className="flex gap-4">
              <div className="flex-1">
                   <p className="text-red-400 font-bold mb-1 uppercase text-[10px] border-b border-zinc-800 pb-1">Cash Outflows</p>
                   {outflows.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-zinc-400 truncate max-w-[80px]" title={entry.name}>{entry.name.replace(' (Out)', '')}</span>
                        <span className="text-zinc-200 font-mono">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                  <div className="mt-1 pt-1 border-t border-zinc-800 flex justify-between">
                     <span className="text-zinc-500 font-semibold">Total</span>
                     <span className="text-zinc-200 font-mono font-bold">{formatCurrency(totalOutflow)}</span>
                  </div>
              </div>

              <div className="w-px bg-zinc-800"></div>

              <div className="flex-1">
                   <p className="text-green-400 font-bold mb-1 uppercase text-[10px] border-b border-zinc-800 pb-1">Value Gained</p>
                   {inflows.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-zinc-400 truncate max-w-[80px]" title={entry.name}>{entry.name.replace(' (In)', '')}</span>
                        <span className="text-zinc-200 font-mono">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                  <div className="mt-1 pt-1 border-t border-zinc-800 flex justify-between">
                     <span className="text-zinc-500 font-semibold">Total</span>
                     <span className="text-zinc-200 font-mono font-bold">{formatCurrency(totalInflow)}</span>
                  </div>
              </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
        {/* Renter Chart */}
        <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Renter Annual Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="year" stroke="#71717a" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="#71717a" tick={{fill: '#71717a', fontSize: 12}} tickFormatter={formatCurrency} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.2 }} />
                <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => value.replace(' (Out)', '').replace(' (In)', '')}
                />

                {/* Stack 1: Outflows */}
                <Bar dataKey="renterRent" stackId="out" name="Rent" fill="#ef4444" stroke="none" isAnimationActive={false} />
                <Bar dataKey="renterInsurance" stackId="out" name="Insurance" fill="#f97316" stroke="none" isAnimationActive={false} />
                <Bar dataKey="renterPortfolioContribution" stackId="out" name="Portfolio Contrib (Out)" fill="#6366f1" stroke="none" isAnimationActive={false} />

                {/* Stack 2: Inflows */}
                <Bar dataKey="renterPortfolioContribution" stackId="in" name="Portfolio Contrib (In)" fill="#6366f1" stroke="none" legendType="none" isAnimationActive={false} />
                <Bar dataKey="renterPortfolioGrowth" stackId="in" name="Portfolio Growth" fill="#06b6d4" stroke="none" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Owner Chart */}
        <div className="w-full h-[400px] p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Owner Annual Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="year" stroke="#71717a" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="#71717a" tick={{fill: '#71717a', fontSize: 12}} tickFormatter={formatCurrency} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3f3f46', opacity: 0.2 }} />
                <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => value.replace(' (Out)', '').replace(' (In)', '')}
                />

                {/* Stack 1: Outflows */}
                <Bar dataKey="ownerInterestPaid" stackId="out" name="Mortgage Interest" fill="#ef4444" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerTax" stackId="out" name="Property Tax" fill="#f97316" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerMaintenance" stackId="out" name="Maintenance" fill="#eab308" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerInsurance" stackId="out" name="Home Insurance" fill="#fbbf24" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerPMI" stackId="out" name="PMI" fill="#db2777" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerPrincipalPaid" stackId="out" name="Principal Paid (Out)" fill="#3b82f6" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerPortfolioContribution" stackId="out" name="Portfolio Contrib (Out)" fill="#6366f1" stroke="none" isAnimationActive={false} />

                {/* Stack 2: Inflows */}
                <Bar dataKey="ownerTaxSavings" stackId="in" name="Tax Savings" fill="#22c55e" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerPrincipalPaid" stackId="in" name="Principal Paid (In)" fill="#3b82f6" stroke="none" legendType="none" isAnimationActive={false} />
                <Bar dataKey="ownerPortfolioContribution" stackId="in" name="Portfolio Contrib (In)" fill="#6366f1" stroke="none" legendType="none" isAnimationActive={false} />
                <Bar dataKey="ownerHomeAppreciation" stackId="in" name="Home Appreciation" fill="#10b981" stroke="none" isAnimationActive={false} />
                <Bar dataKey="ownerPortfolioGrowth" stackId="in" name="Portfolio Growth" fill="#06b6d4" stroke="none" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
