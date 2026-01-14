import { create } from 'zustand';
import { SimulationParams, SimulationResult, simulateTimeline } from '@/lib/engine';

interface SimulationState {
  inputs: SimulationParams;
  results: SimulationResult;
  setInputs: (inputs: Partial<SimulationParams>) => void;
}

export const DEFAULT_INPUTS: SimulationParams = {
  homePrice: 525000, // San Bernardino Median (~$525k)
  // Realistic down payment for first-time buyers
  downPaymentPercentage: 10,
  mortgageRate: 6.5, // Current market rate (~6.5%)
  loanTermYears: 30,
  propertyTaxRate: 1.32, // San Bernardino County effective rate
  homeInsuranceRate: 0.30, // Fire risk adjusted (~$1600/yr)
  maintenanceCostPercentage: 1.0,
  homeAppreciationRate: 3.5,
  sellingCostPercentage: 6.0,
  monthlyRent: 2500, // San Bernardino 3bd House Rent
  rentInflationRate: 3.5,
  rentersInsuranceMonthly: 15,
  // S&P 500 historical average
  investmentReturnRate: 10.0,
  inflationRate: 3.0,
  simulationYears: 35,
  // No investment, inflate the lifestyle instead.
  renterDiscipline: 0,
  ownerDiscipline: 0,
  pmiRate: 0.5, // Default PMI rate 0.5%
  isProp13: true, // CA Prop 13 active
  inflationAdjusted: false,
  // Household Income (Dual income or slightly above median to afford)
  grossIncome: 115000,
  federalTaxRate: 22.0,
  stateTaxRate: 9.3, // CA Tax Bracket
  incomeGrowthRate: 3.0,
  itemizedDeductionRate: 0, // Default to standard deduction (0% itemized benefit assumed initially)
};

export const useSimulationStore = create<SimulationState>((set) => ({
  inputs: DEFAULT_INPUTS,
  results: simulateTimeline(DEFAULT_INPUTS),
  setInputs: (newInputs) =>
    set((state) => {
      const updatedInputs = { ...state.inputs, ...newInputs };
      return {
        inputs: updatedInputs,
        results: simulateTimeline(updatedInputs),
      };
    }),
}));
