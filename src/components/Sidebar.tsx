'use client';

import React, { useState, useEffect } from 'react';
import { Home, Building2, TrendingUp, ChevronDown, ChevronRight, Menu, X, DollarSign } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { SimulationInputGroup } from './SimulationInputGroup';
import { Checkbox } from './ui/Checkbox';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_VERSION } from '@/lib/config';

// Helper to format currency for helper text
const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
};

const ExpandableSection = ({ isOpen, children }: { isOpen: boolean, children: React.ReactNode }) => {
    const [render, setRender] = useState(isOpen);
    const [visible, setVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            // Double raf to ensure browser paints initial state before transitioning
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setVisible(true);
                });
            });
        } else {
            setVisible(false);
            const timer = setTimeout(() => {
                setRender(false);
            }, 300); // matches duration-300
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!render) return null;

    return (
        <div
            className={cn(
                "grid transition-all duration-300 ease-in-out",
                visible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
        >
            <div className="overflow-hidden">
                {children}
            </div>
        </div>
    );
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
                <div className="flex flex-col gap-5 pl-1">
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

        {/* Section: Household Income */}
        <SidebarSection title="Household Income" icon={DollarSign}>
            <SimulationInputGroup
                label="Gross Income"
                value={inputs.grossIncome}
                onChange={update('grossIncome')}
                min={30000}
                max={5000000}
                step={5000}
                prefix="$"
                inputClassName="w-32"
            />
            <SimulationInputGroup
                label="Federal Tax"
                value={inputs.federalTaxRate}
                onChange={update('federalTaxRate')}
                min={0}
                max={50}
                step={0.5}
                suffix="%"
                inputClassName="w-20"
            />
            <SimulationInputGroup
                label="State Tax"
                value={inputs.stateTaxRate}
                onChange={update('stateTaxRate')}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />
             <SimulationInputGroup
                label="Income Growth"
                value={inputs.incomeGrowthRate ?? inputs.inflationRate}
                onChange={update('incomeGrowthRate')}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                inputClassName="w-20"
            />
        </SidebarSection>

        <hr className="border-white/5" />

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
                inputClassName="w-32"
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
            <ExpandableSection isOpen={inputs.downPaymentPercentage < 20}>
                <SimulationInputGroup
                    label="PMI Rate"
                    value={inputs.pmiRate ?? 0.5}
                    onChange={update('pmiRate')}
                    min={0}
                    max={2.5}
                    step={0.1}
                    suffix="%"
                    inputClassName="w-20"
                />
            </ExpandableSection>
             <SimulationInputGroup
                label="Interest Rate"
                value={inputs.mortgageRate}
                onChange={update('mortgageRate')}
                min={2}
                max={15}
                step={0.125}
                suffix="%"
                inputClassName="w-24"
            />
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
        </SidebarSection>

        <hr className="border-white/5" />

        {/* Section: Savings Discipline */}
        <SidebarSection title="Savings Discipline" icon={TrendingUp}>
             <SimulationInputGroup
                label="Renter Discipline"
                value={inputs.renterDiscipline}
                onChange={update('renterDiscipline')}
                min={0}
                max={100}
                step={5}
                suffix="%"
                inputClassName="w-20"
            />
             <SimulationInputGroup
                label="Owner Discipline"
                value={inputs.ownerDiscipline}
                onChange={update('ownerDiscipline')}
                min={0}
                max={100}
                step={5}
                suffix="%"
                inputClassName="w-20"
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
                inputClassName="w-28"
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
             <SimulationInputGroup
                label="Renters Ins."
                value={inputs.rentersInsuranceMonthly}
                onChange={update('rentersInsuranceMonthly')}
                min={0}
                max={200}
                step={5}
                prefix="$"
                inputClassName="w-24"
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
            <div className="space-y-3">
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
                <div className="flex items-center gap-2 px-1">
                    <Checkbox
                        id="inflation-adjusted"
                        checked={inputs.inflationAdjusted ?? false}
                        onCheckedChange={(checked) => setInputs({ inflationAdjusted: checked })}
                    />
                    <label
                        htmlFor="inflation-adjusted"
                        className="text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-300 transition-colors"
                    >
                        Adjust results for inflation
                    </label>
                </div>
            </div>

            <div className="space-y-3">
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
                <div className="flex items-center gap-2 px-1">
                    <Checkbox
                        id="prop-13"
                        checked={inputs.isProp13 ?? false}
                        onCheckedChange={(checked) => setInputs({ isProp13: checked })}
                    />
                    <label
                        htmlFor="prop-13"
                        className="text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-300 transition-colors"
                    >
                        Enable CA Prop 13 limits
                    </label>
                </div>
            </div>
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
        </SidebarSection>

      </div>
    </aside>
    </>
  );
};
