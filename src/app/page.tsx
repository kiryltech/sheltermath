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
import { BarChart3, Sparkles } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { cn } from '@/lib/utils';
import { AiAdvisorModal } from '@/components/AiAdvisorModal';

export default function Home() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { inputs, setInputs } = useSimulationStore();

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-8 w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
            <header className="h-auto border-b border-white/5 bg-zinc-900/80 backdrop-blur px-6 py-4 flex flex-col gap-4 z-10 mb-6 rounded-xl border-zinc-800">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            The Verdict
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono border border-white/5 uppercase tracking-wide">
                                {inputs.simulationYears} Year Outlook
                            </span>
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1">Comparing total financial outcome of buying this property vs. renting and investing the difference.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Years Selector */}
                        <div className="bg-zinc-900 p-1 rounded-lg flex border border-white/5">
                            {[20, 35, 50].map((years) => (
                                <button
                                    key={years}
                                    onClick={() => setInputs({ simulationYears: years })}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded shadow-sm transition-colors",
                                        inputs.simulationYears === years
                                            ? "text-white bg-white/10"
                                            : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    {years}Y
                                </button>
                            ))}
                        </div>

                        {/* AI Assistant Button */}
                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="flex items-center gap-2 bg-[#5048e5] hover:bg-[#5048e5]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_-3px_rgba(80,72,229,0.3)]"
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Analysis
                        </button>
                    </div>
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

            <AiAdvisorModal
              isOpen={isAiModalOpen}
              onClose={() => setIsAiModalOpen(false)}
            />

            <Footer />
        </div>
      </main>
    </div>
  );
}
