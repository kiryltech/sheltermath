"use client";

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { TrendingUp, Wallet, PiggyBank, Receipt, Scale, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    subtext?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon: Icon, children, className, subtext }) => (
    <div className={cn(
        "relative overflow-hidden p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/60 group",
        className
    )}>
        <div className="flex items-start justify-between mb-2">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
            {Icon && <Icon className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />}
        </div>
        <div className="relative z-10">
            {children}
        </div>
        {subtext && <p className="text-xs text-zinc-500 mt-2 font-medium">{subtext}</p>}

        {/* Glow effect */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all duration-500" />
    </div>
);

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
    if (years > 0) parts.push(`${years} Yr${years === 1 ? '' : 's'}`);
    if (months > 0) parts.push(`${months} Mo${months === 1 ? '' : 's'}`);

    if (parts.length === 0) return "Immediate";
    return parts.join(' ');
  };

  const netWorthDiff = summary.finalOwnerNetWorth - summary.finalRenterNetWorth;
  const isBuyingBetter = netWorthDiff > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">

      <MetricCard
        title="Equity Crossover"
        icon={TrendingUp}
        subtext="When buying beats renting net worth"
      >
        <div className="text-3xl font-bold text-white tracking-tight">
          {crossoverDate ? formatDuration(crossoverDate.totalMonths) : "Never"}
        </div>
      </MetricCard>

      <MetricCard
        title="Monthly Break-Even"
        icon={Scale}
        subtext="When owning costs less monthly"
      >
        <div className="text-3xl font-bold text-white tracking-tight">
          {monthlyPaymentCrossoverDate ? formatDuration(monthlyPaymentCrossoverDate.totalMonths) : "Never"}
        </div>
      </MetricCard>

      <div className="flex flex-col gap-4">
        <MetricCard
            title={`Net Worth Diff (${inputs.simulationYears}Y)`}
            icon={PiggyBank}
            className="flex-1"
            subtext={isBuyingBetter ? "Advantage to Buying" : "Advantage to Renting"}
        >
          <div className={cn(
              "text-2xl font-bold tracking-tight",
              isBuyingBetter ? "text-emerald-400" : "text-rose-400"
          )}>
            {isBuyingBetter ? "+" : ""}{formatCurrency(netWorthDiff)}
          </div>
        </MetricCard>

        <MetricCard title="Renter Contributions" className="flex-1" icon={Wallet}>
            <div className="space-y-1.5 mt-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Initial Capital</span>
                    <span className="text-zinc-200 font-mono">{formatCurrency(summary.renterTotalInitialContribution)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Monthly Savings</span>
                    <span className="text-zinc-200 font-mono">{formatCurrency(summary.renterTotalContinuousContribution)}</span>
                </div>
            </div>
        </MetricCard>
      </div>

      <div className="flex flex-col gap-4">
        <MetricCard
            title="Total Interest"
            icon={Receipt}
            className="flex-1"
            subtext={`Paid over ${inputs.simulationYears} years`}
        >
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(summary.totalInterestPaid)}
          </div>
        </MetricCard>

        <MetricCard title="Renter Yield" className="flex-1" icon={ArrowRightLeft}>
            <div className="space-y-1.5 mt-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">On Initial</span>
                    <span className="text-zinc-200 font-mono">{formatCurrency(summary.renterTotalInitialYield)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">On Monthly</span>
                    <span className="text-zinc-200 font-mono">{formatCurrency(summary.renterTotalContinuousYield)}</span>
                </div>
            </div>
        </MetricCard>
      </div>

    </div>
  );
};
