'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { SimulationInputGroup } from './SimulationInputGroup';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_VERSION } from '@/lib/config';

// Helper to format currency for helper text
const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
};

export const Sidebar = () => {
  const { inputs, setInputs } = useSimulationStore();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpenMobile(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const update = (key: keyof typeof inputs) => (val: number) => {
      setInputs({ [key]: val });
  };

  // Helper for Down Payment in $
  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPercentage / 100);

  return (
    <>
      {/* Mobile Toggle Button (Only visible on mobile when sidebar is closed) */}
      {!isOpenMobile && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-800 text-white rounded-md shadow-lg"
          onClick={() => setIsOpenMobile(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
            "fixed inset-y-0 left-0 z-40 w-full md:relative md:w-[320px] flex-shrink-0 bg-surface-dark border-r border-white/5 flex flex-col h-full shadow-xl overflow-hidden transition-transform duration-300 ease-in-out md:translate-x-0 font-display",
            isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">domain</span>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white uppercase">{APP_NAME}</h1>
                <p className="text-xs text-zinc-500 font-mono">{APP_VERSION}</p>
              </div>
          </div>
          {/* Mobile Close Button */}
          <button
            className="md:hidden p-1 text-zinc-400 hover:text-white"
            onClick={() => setIsOpenMobile(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Inputs Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 custom-scrollbar">

        {/* Section: Property Basics */}
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-zinc-500 text-[18px]">home</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Property Basics</h2>
            </div>

            <SimulationInputGroup
                label="Home Price"
                value={inputs.homePrice}
                onChange={update('homePrice')}
                min={100000}
                max={3000000}
                step={10000}
                prefix="$"
                inputClassName="w-28"
            />
            <SimulationInputGroup
                label="Down Payment"
                value={inputs.downPaymentPercentage}
                onChange={update('downPaymentPercentage')}
                min={0}
                max={100}
                step={1}
                suffix="%"
                helperText={formatCurrency(downPaymentAmount)}
                inputClassName="w-20"
            />
             <SimulationInputGroup
                label="Interest Rate"
                value={inputs.mortgageRate}
                onChange={update('mortgageRate')}
                min={2}
                max={15}
                step={0.125}
                suffix="%"
                inputClassName="w-20"
            />
            {/* Keeping Loan Term but not shown in design explicitly, grouping here makes sense */}
            <SimulationInputGroup
                label="Loan Term"
                value={inputs.loanTermYears}
                onChange={update('loanTermYears')}
                min={10}
                max={40}
                step={5}
                suffix="Yr"
                inputClassName="w-20"
            />
        </div>

        <hr className="border-white/5" />

        {/* Section: Rental Market */}
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-zinc-500 text-[18px]">apartment</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Rental Market</h2>
            </div>
            <SimulationInputGroup
                label="Monthly Rent"
                value={inputs.monthlyRent}
                onChange={update('monthlyRent')}
                min={500}
                max={15000}
                step={50}
                prefix="$"
                inputClassName="w-24"
            />
            <SimulationInputGroup
                label="Rent Inflation"
                value={inputs.rentInflationRate}
                onChange={update('rentInflationRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />
             {/* Not in design but necessary */}
             <SimulationInputGroup
                label="Renters Ins."
                value={inputs.rentersInsuranceMonthly}
                onChange={update('rentersInsuranceMonthly')}
                min={0}
                max={200}
                step={5}
                prefix="$"
                inputClassName="w-20"
            />
        </div>

        <hr className="border-white/5" />

        {/* Section: Forecasts */}
        <div className="space-y-5 pb-10">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-zinc-500 text-[18px]">trending_up</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Forecasts</h2>
            </div>
            <SimulationInputGroup
                label="Home Appreciation"
                value={inputs.homeAppreciationRate}
                onChange={update('homeAppreciationRate')}
                min={-5}
                max={15}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />
            <SimulationInputGroup
                label="Investment Return"
                value={inputs.investmentReturnRate}
                onChange={update('investmentReturnRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />

            {/* The rest of the inputs - maybe grouped or just listed under forecasts? */}
            {/* Design only shows the first two. I will keep the others here as they fit "Forecasts" roughly or create a generic "Assumptions" section. */}

            <SimulationInputGroup
                label="Inflation Rate"
                value={inputs.inflationRate}
                onChange={update('inflationRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />
             <SimulationInputGroup
                label="Property Tax"
                value={inputs.propertyTaxRate}
                onChange={update('propertyTaxRate')}
                min={0}
                max={5}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />
             <SimulationInputGroup
                label="Maintenance"
                value={inputs.maintenanceCostPercentage}
                onChange={update('maintenanceCostPercentage')}
                min={0}
                max={5}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />

             {/* Savings Discipline - putting it here or at the end. Design doesn't emphasize it. */}
             {/* I will add a small divider and title if I want to keep it distinct, or just lump it in Forecasts/Assumptions. */}
             {/* Let's keep it under Forecasts but maybe with a subtle separator or just in the list. */}
             {/* Actually, let's create a "Discipline" section since it's user behavior, not market forecast. */}
        </div>

         <hr className="border-white/5" />

        {/* Section: Discipline (Extra) */}
        <div className="space-y-5 pb-10">
             <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-zinc-500 text-[18px]">savings</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Discipline</h2>
            </div>
             <SimulationInputGroup
                label="Renter Invest %"
                value={inputs.renterDiscipline}
                onChange={update('renterDiscipline')}
                min={0}
                max={100}
                step={5}
                suffix="%"
                inputClassName="w-20"
            />
             <SimulationInputGroup
                label="Owner Invest %"
                value={inputs.ownerDiscipline}
                onChange={update('ownerDiscipline')}
                min={0}
                max={100}
                step={5}
                suffix="%"
                inputClassName="w-20"
            />
        </div>

      </div>
    </aside>
    </>
  );
};
