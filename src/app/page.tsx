import { Sidebar } from '@/components/Sidebar';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { AnnualBreakdownCharts } from '@/components/charts/AnnualBreakdownCharts';
import { SummaryMetrics } from '@/components/SummaryMetrics';

export default function Home() {
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
                <NetWorthChart />
                <CashFlowChart />
            </div>

            <div className="mb-8">
              <AnnualBreakdownCharts />
            </div>
        </div>
      </main>
    </div>
  );
}
