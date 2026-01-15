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
    <div className="flex h-screen overflow-hidden flex-col md:flex-row bg-transparent">
      <Sidebar />

      <main className="flex-1 flex flex-col w-full overflow-y-auto relative scroll-smooth">
        {/* Decorative background element for main area */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6">

            {/* Header Card */}
            <header className="relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 shadow-2xl z-10">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-2xl font-bold text-white tracking-tight">
                                The Verdict
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-900 text-[11px] text-zinc-300 font-bold border border-white/10 uppercase tracking-wider shadow-sm">
                                {inputs.simulationYears} Year Outlook
                            </span>
                        </div>

                        <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                            Comparing the long-term financial outcomes of buying a property versus renting and investing the difference.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Years Selector */}
                        <div className="bg-zinc-950/50 p-1 rounded-xl flex border border-white/5 shadow-inner">
                            {[20, 35, 50].map((years) => (
                                <button
                                    key={years}
                                    onClick={() => setInputs({ simulationYears: years })}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                                        inputs.simulationYears === years
                                            ? "text-white bg-zinc-800 shadow-md border border-white/5"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    {years}Y
                                </button>
                            ))}
                        </div>

                        {/* AI Assistant Button */}
                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="group relative inline-flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-violet-600 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Sparkles className="w-4 h-4 text-indigo-100 group-hover:text-white transition-colors" />
                            <span>AI Analysis</span>
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Metrics Grid */}
            <SummaryMetrics />

            {/* Charts Grid 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HousingIncomeRatioChart />
                <LifestyleBudgetChart />
            </div>

            {/* Charts Grid 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetWorthChart />
                <CashFlowChart />
            </div>

            {/* View Breakdown Button */}
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => setIsBreakdownOpen(true)}
                className="group flex items-center gap-2 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold rounded-2xl transition-all border border-zinc-800 hover:border-zinc-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <BarChart3 className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                <span>View Annual Breakdown</span>
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
