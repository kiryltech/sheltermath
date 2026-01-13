import { create } from 'zustand';
import { SimulationParams, SimulationResult, simulateTimeline } from '@/lib/engine';

interface SimulationState {
  inputs: SimulationParams;
  results: SimulationResult;
  setInputs: (inputs: Partial<SimulationParams>) => void;
}

export const DEFAULT_INPUTS: SimulationParams = {
  homePrice: 850000,
  downPaymentPercentage: 20,
  mortgageRate: 6.875,
  loanTermYears: 30,
  propertyTaxRate: 1.2,
  homeInsuranceRate: 0.35,
  maintenanceCostPercentage: 1.0,
  homeAppreciationRate: 4.0,
  sellingCostPercentage: 6.0,
  monthlyRent: 4200,
  rentInflationRate: 6.0,
  rentersInsuranceMonthly: 15,
  investmentReturnRate: 10.0,
  inflationRate: 3.0,
  simulationYears: 35,
  // No investment, inflate the lifestyle instead.
  renterDiscipline: 0,
  ownerDiscipline: 0,
  pmiRate: 0.5, // Default PMI rate 0.5%
  inflationAdjusted: false,
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
