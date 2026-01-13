"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { AnnualBreakdownCharts } from '@/components/charts/AnnualBreakdownCharts';
import { HousingIncomeRatioChart } from '@/components/charts/HousingIncomeRatioChart';
import { LifestyleBudgetChart } from '@/components/charts/LifestyleBudgetChart';
import { SummaryMetrics } from '@/components/SummaryMetrics';
import { Modal } from '@/components/ui/Modal';
import { Footer } from '@/components/Footer';
import { BarChart3, Bot } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const { inputs, setInputs } = useSimulationStore();

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-8 w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
            <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Rent vs. Buy Analysis</h1>
                  <p className="text-zinc-400 max-w-2xl">Compare the long-term financial outcomes of buying a home versus renting and investing. Customize economic assumptions to forecast your net worth and cash flow over time.</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Years Selector */}
                    <div className="flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                        {[20, 35, 50].map((years) => (
                            <button
                                key={years}
                                onClick={() => setInputs({ simulationYears: years })}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                                    inputs.simulationYears === years
                                        ? "bg-zinc-600 text-white shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                                )}
                            >
                                {years} Years
                            </button>
                        ))}
                    </div>

                    {/* AI Assistant Button */}
                    <Tooltip content="Coming soon">
                        <button
                            className="p-2 text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-not-allowed opacity-75 hover:bg-zinc-800 transition-colors"
                            aria-label="AI Assistant"
                        >
                            <Bot className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </header>

            <SummaryMetrics />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <HousingIncomeRatioChart />
                <LifestyleBudgetChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <NetWorthChart />
                <CashFlowChart />
            </div>

            <div className="mb-8 flex justify-center">
              <button
                onClick={() => setIsBreakdownOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600 shadow-sm"
              >
                <BarChart3 className="w-5 h-5" />
                View Annual Breakdown
              </button>
            </div>

            <Modal
              isOpen={isBreakdownOpen}
              onClose={() => setIsBreakdownOpen(false)}
              title="Annual Breakdown"
              className="max-w-7xl"
            >
              {isBreakdownOpen && <AnnualBreakdownCharts />}
            </Modal>

            <Footer />
        </div>
      </main>
    </div>
  );
}
