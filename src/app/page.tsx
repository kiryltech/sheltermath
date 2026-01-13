import { Sidebar } from '@/components/Sidebar';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { AnnualBreakdownCharts } from '@/components/charts/AnnualBreakdownCharts';
import { VerdictHeader } from '@/components/VerdictHeader';

export default function Home() {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-6 w-full overflow-y-auto relative">
         {/* Background Glows (Atmosphere) */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0"></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-buy/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen z-0"></div>

        <div className="max-w-7xl mx-auto w-full z-10">
            {/* Header / Verdict */}
            <VerdictHeader />

            {/* Charts Area */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {/* Net Worth Projection */}
                <div className="flex flex-col min-h-[400px] bg-surface-dark/30 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                    <NetWorthChart />
                </div>

                {/* Monthly Cost Breakdown (Cash Flow) */}
                <div className="flex flex-col min-h-[400px] bg-surface-dark/30 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                    <CashFlowChart />
                </div>
            </div>

            {/* Detailed Annual Breakdown */}
             <div className="flex flex-col min-h-[400px] bg-surface-dark/30 border border-white/5 rounded-xl p-5 relative overflow-hidden mb-8">
                 <h3 className="text-sm font-semibold text-white mb-4">Detailed Annual Breakdown</h3>
                 <AnnualBreakdownCharts />
            </div>
        </div>
      </main>
    </div>
  );
}
