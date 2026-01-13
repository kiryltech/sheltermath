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
import { BarChart3 } from 'lucide-react';

export default function Home() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-8 w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Rent vs. Buy Analysis</h1>
                <p className="text-zinc-400">Comparing the long-term financial impact of purchasing a home versus renting and investing the difference.</p>
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
