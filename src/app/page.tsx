import { Sidebar } from '@/components/Sidebar';

export default function Home() {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center p-10 w-full">
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Phase 2 Complete</h1>
            <p className="text-zinc-400">Sidebar inputs are connected to the store.</p>
            <p className="text-zinc-500 text-sm mt-2">Next Phase: Visualization (Charts)</p>
        </div>
      </main>
    </div>
  );
}
