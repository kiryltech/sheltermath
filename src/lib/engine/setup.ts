import { SimulationParams, OwnerMonthlyState, RenterMonthlyState } from './types';
import { calculateMonthlyPayments, calculateMonthlyGeometricRate } from './utils';
import { calculateOwnerSchedule } from './owner';
import { calculateRenterSchedule } from './renter';

export interface SimulationContext {
  downPayment: number;
  loanPrincipal: number;
  monthlyMortgagePI: number;
  monthlyInvestmentReturn: number;
  monthlyIncomeGrowth: number;
  monthlyDiscountRate: number;
  ownerSchedule: OwnerMonthlyState[];
  renterSchedule: RenterMonthlyState[];
}

export function setupSimulation(params: SimulationParams): SimulationContext {
  const {
    homePrice,
    downPaymentPercentage,
    mortgageRate,
    loanTermYears,
    investmentReturnRate,
    incomeGrowthRate,
    inflationRate,
    inflationAdjusted
  } = params;

  const actualIncomeGrowthRate = incomeGrowthRate ?? inflationRate;

  // Initial calculations
  const downPayment = homePrice * (downPaymentPercentage / 100);
  const loanPrincipal = homePrice - downPayment;
  const monthlyMortgagePI = calculateMonthlyPayments(loanPrincipal, mortgageRate, loanTermYears);

  // Use Geometric compounding for Investment Return (Effective Annual Rate)
  const monthlyInvestmentReturn = calculateMonthlyGeometricRate(investmentReturnRate);
  const monthlyIncomeGrowth = calculateMonthlyGeometricRate(actualIncomeGrowthRate);

  // Calculate discount rate if inflation adjustment is enabled
  const monthlyDiscountRate = inflationAdjusted ? calculateMonthlyGeometricRate(inflationRate) : 0;

  // Generate Schedules
  const ownerSchedule = calculateOwnerSchedule(params, monthlyMortgagePI, loanPrincipal);
  const renterSchedule = calculateRenterSchedule(params);

  return {
    downPayment,
    loanPrincipal,
    monthlyMortgagePI,
    monthlyInvestmentReturn,
    monthlyIncomeGrowth,
    monthlyDiscountRate,
    ownerSchedule,
    renterSchedule
  };
}
