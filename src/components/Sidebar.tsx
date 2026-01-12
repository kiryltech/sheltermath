'use client';

import React, { useState, useEffect } from 'react';
import { Home, Building2, TrendingUp, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { SimulationInputGroup } from './SimulationInputGroup';
import { cn } from '@/lib/utils';

// Helper to format currency for helper text
const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
};

interface SectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const SidebarSection: React.FC<SectionProps> = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full text-left hover:text-zinc-300 transition-colors"
            >
                <Icon className="text-zinc-500 w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex-1">{title}</h2>
                {isOpen ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
            </button>

            {isOpen && (
                <div className="space-y-5 pl-1">
                    {children}
                </div>
            )}
        </div>
    );
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
            "fixed inset-y-0 left-0 z-40 w-full md:relative md:w-[320px] flex-shrink-0 bg-zinc-900 border-r border-white/5 flex flex-col h-full shadow-xl overflow-hidden transition-transform duration-300 ease-in-out md:translate-x-0",
            isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="text-primary font-bold text-xl">SM</div>
               {/* Using text for logo for now as I don't have the icon svg ready other than lucide */}
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">Shelter Math</h1>
              <p className="text-xs text-zinc-500 font-mono">v2.4.0_beta</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

        {/* Section: Property */}
        <SidebarSection title="Property Basics" icon={Home}>
            <SimulationInputGroup
                label="Home Price"
                value={inputs.homePrice}
                onChange={update('homePrice')}
                min={100000}
                max={3000000}
                step={10000}
                prefix="$"
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
            />
             <SimulationInputGroup
                label="Interest Rate"
                value={inputs.mortgageRate}
                onChange={update('mortgageRate')}
                min={2}
                max={15}
                step={0.125}
                suffix="%"
            />
             {/* Collapsed Advanced Property Settings? Or just list them?
                 Let's add them but maybe user can scroll */}
            <SimulationInputGroup
                label="Loan Term"
                value={inputs.loanTermYears}
                onChange={update('loanTermYears')}
                min={10}
                max={40}
                step={5}
                suffix="Yr"
            />
        </SidebarSection>

        <hr className="border-white/5" />

        {/* Section: Rental Market */}
        <SidebarSection title="Rental Market" icon={Building2}>
            <SimulationInputGroup
                label="Monthly Rent"
                value={inputs.monthlyRent}
                onChange={update('monthlyRent')}
                min={500}
                max={15000}
                step={50}
                prefix="$"
            />
            <SimulationInputGroup
                label="Rent Inflation"
                value={inputs.rentInflationRate}
                onChange={update('rentInflationRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
            />
             <SimulationInputGroup
                label="Renters Ins."
                value={inputs.rentersInsuranceMonthly}
                onChange={update('rentersInsuranceMonthly')}
                min={0}
                max={200}
                step={5}
                prefix="$"
            />
        </SidebarSection>

        <hr className="border-white/5" />

        {/* Section: Forecasts */}
        <SidebarSection title="Forecasts" icon={TrendingUp}>
            <SimulationInputGroup
                label="Home Appreciation"
                value={inputs.homeAppreciationRate}
                onChange={update('homeAppreciationRate')}
                min={-5}
                max={15}
                step={0.1}
                suffix="%"
            />
            <SimulationInputGroup
                label="Investment Return"
                value={inputs.investmentReturnRate}
                onChange={update('investmentReturnRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
            />
            <SimulationInputGroup
                label="Inflation Rate"
                value={inputs.inflationRate}
                onChange={update('inflationRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
            />
             <SimulationInputGroup
                label="Property Tax"
                value={inputs.propertyTaxRate}
                onChange={update('propertyTaxRate')}
                min={0}
                max={5}
                step={0.1}
                suffix="%"
            />
             <SimulationInputGroup
                label="Maintenance"
                value={inputs.maintenanceCostPercentage}
                onChange={update('maintenanceCostPercentage')}
                min={0}
                max={5}
                step={0.1}
                suffix="%"
            />
        </SidebarSection>

      </div>
    </aside>
    </>
  );
};
