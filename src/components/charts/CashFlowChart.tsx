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
} from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';

// Tooltip component definition moved outside render
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
      // payload[0].payload is the data object
      const d = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs z-50">
        <p className="font-bold text-zinc-300 mb-1">Year {d.year}</p>
        <div className="flex justify-between gap-4 text-red-400"><span>Interest:</span> <span>${d.interest.toFixed(0)}</span></div>
        <div className="flex justify-between gap-4 text-indigo-400"><span>Tax/Maint:</span> <span>${d.taxMaint.toFixed(0)}</span></div>
        <div className="flex justify-between gap-4 text-orange-500"><span>Principal:</span> <span>${d.principal.toFixed(0)}</span></div>
        <div className="mt-1 pt-1 border-t border-zinc-700 flex justify-between gap-4 text-cyan-400"><span>Rent:</span> <span>${d.rent.toFixed(0)}</span></div>
      </div>
    );
  }
  return null;
};

export const CashFlowChart = () => {
  const { results } = useSimulationStore();
  const { annualFlows } = results;

  const data = annualFlows.map(flow => {
      // Monthly averages for this year
      const monthlyInterest = flow.ownerInterestPaid / 12;
      const monthlyTaxMaint = (flow.ownerTax + flow.ownerMaintenance + flow.ownerInsurance) / 12;
      const monthlyPrincipal = flow.ownerPrincipalPaid / 12;
      const monthlyRent = (flow.renterRent + flow.renterInsurance) / 12;

      return {
          year: flow.year,
          interest: monthlyInterest,
          taxMaint: monthlyTaxMaint,
          principal: monthlyPrincipal, // Equity part
          rent: monthlyRent,
          totalOwner: monthlyInterest + monthlyTaxMaint + monthlyPrincipal
      };
  }).filter((_, i) => i % 5 === 0 || i === 0); // Sample every 5 years

  const formatCurrency = (value: number) => {
    return `$${(value/1000).toFixed(1)}k`;
  };

  return (
    <>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-sm font-semibold text-white">Monthly Cost Breakdown</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Interest + Taxes + Maintenance vs. Rent</p>
            </div>
             {/* Custom Legend to match design */}
            <div className="flex items-center gap-4 text-xs font-medium">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rent rounded-sm opacity-80"></div>
                    <span className="text-zinc-300">Rent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-sm opacity-80"></div>
                    <span className="text-zinc-300">Interest</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-400 rounded-sm opacity-80"></div>
                    <span className="text-zinc-300">Tax/Maint</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-buy/20 border border-white/10 rounded-sm"></div>
                    <span className="text-zinc-300">Equity</span>
                </div>
            </div>
        </div>

        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 0,
                }}
                barCategoryGap="20%"
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                    dataKey="year"
                    stroke="#71717a"
                    tick={{fill: '#52525b', fontSize: 10, fontFamily: 'monospace'}}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `Y${val}`}
                />
                <YAxis
                    stroke="#71717a"
                    tick={{fill: '#52525b', fontSize: 10, fontFamily: 'monospace'}}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />

                {/* Rent Bar added for comparison */}
                <Bar dataKey="rent" fill="#22d3ee" radius={[2, 2, 0, 0]} /> {/* rent (cyan-400) */}

                {/* Owner Stack */}
                <Bar dataKey="interest" stackId="a" fill="#f87171" radius={[2, 2, 0, 0]} /> {/* Red-400 */}
                <Bar dataKey="taxMaint" stackId="a" fill="#818cf8" /> {/* Indigo-400 */}
                <Bar dataKey="principal" stackId="a" fill="rgba(249, 115, 22, 0.2)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} radius={[0, 0, 2, 2]} /> {/* Buy/20 */}

            </BarChart>
            </ResponsiveContainer>
        </div>
    </>
  );
};
