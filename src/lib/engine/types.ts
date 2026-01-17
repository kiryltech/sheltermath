// Simulation Parameters
export interface SimulationParams {
  // Property
  homePrice: number;
  downPaymentPercentage: number;
  mortgageRate: number; // Annual percentage (e.g., 6.5 for 6.5%)
  loanTermYears: number;
  propertyTaxRate: number; // Annual percentage
  homeInsuranceRate: number; // Annual percentage of home value (e.g. 0.35%)
  maintenanceCostPercentage: number; // Annual percentage of home value
  homeAppreciationRate: number; // Annual percentage
  sellingCostPercentage: number; // Cost to sell home (e.g. 6%)
  pmiRate?: number; // Annual percentage of loan amount (e.g. 0.5%)
  isProp13?: boolean; // Use CA Prop 13 tax calculation (2% max growth on assessed value)

  // Rental
  monthlyRent: number;
  rentInflationRate: number; // Annual percentage
  rentersInsuranceMonthly: number;

  // Market
  investmentReturnRate: number; // Annual percentage (e.g., 7 for 7%)
  inflationRate: number; // Annual percentage (general inflation)

  // Income
  grossIncome: number;
  federalTaxRate: number;
  stateTaxRate: number;
  contribution401k: number; // Annual 401k contribution (starts at this value, grows with income)
  incomeGrowthRate?: number; // Defaults to inflationRate if not provided
  itemizedDeductionRate?: number; // 0 to 100% of potential deductions claimed (default 0)

  // Simulation
  simulationYears: number;
  inflationAdjusted?: boolean;

  // Discipline
  renterDiscipline: number; // Percentage (0-100) of excess cash invested
  ownerDiscipline: number; // Percentage (0-100) of excess cash invested
}

export interface OwnerMonthlyState {
    mortgagePayment: number;
    propertyTax: number;
    homeInsurance: number;
    maintenanceCost: number;
    pmiPayment: number;
    totalOutflow: number;
    interestPayment: number;
    principalPayment: number;
    remainingPrincipal: number;
    homeValue: number;
    realizableEquity: number;
    monthlyAppreciation: number;
}

export interface RenterMonthlyState {
    rentPayment: number;
    rentersInsurance: number;
    totalOutflow: number;
}

export interface AnnualFlows {
  year: number;
  // Renter
  renterRent: number;
  renterInsurance: number;
  renterPortfolioContribution: number;
  renterPortfolioGrowth: number;

  // Owner
  ownerPrincipalPaid: number;
  ownerInterestPaid: number;
  ownerTax: number;
  ownerInsurance: number;
  ownerMaintenance: number;
  ownerPMI: number; // New field for PMI
  ownerTaxSavings: number; // Deductible tax savings
  ownerHomeAppreciation: number;
  ownerPortfolioContribution: number;
  ownerPortfolioGrowth: number;
}

export interface MonthlyCashFlow {
  month: number;
  year: number;

  // Buying Costs
  mortgagePayment: number; // P&I (Fixed, then 0)
  propertyTax: number;
  homeInsurance: number;
  maintenanceCost: number;
  pmiPayment?: number; // Added PMI payment to monthly data for transparency
  totalOwnerCosts: number; // Unrecoverable costs
  totalOwnerOutflow: number; // P&I + Tax + Maint + Insurance + PMI

  // Renting Costs
  rentPayment: number;
  rentersInsurance: number;
  totalRenterOutflow: number;

  // Difference
  savings: number; // Absolute difference |OwnerOutflow - RenterOutflow|
  investedAmount: number; // The amount added to investment pool this month (after discipline).
  ownerNetWorth: number;
  renterNetWorth: number;

  // Income & Ratios
  grossIncome: number;
  netIncome: number;
  lifestyleBudgetRenter: number;
  lifestyleBudgetOwner: number;
  housingIncomeRatioOwner: number;
  housingIncomeRatioRenter: number;
}

export interface AnnualSnapshot {
  year: number;
  ownerNetWorth: number;
  renterNetWorth: number;
  crossover: boolean;
}

export interface SimulationResult {
  monthlyData: MonthlyCashFlow[];
  annualData: AnnualSnapshot[];
  annualFlows: AnnualFlows[];
  crossoverDate: { year: number; totalMonths: number } | null;
  monthlyPaymentCrossoverDate: { year: number; totalMonths: number } | null;
  summary: {
    totalInterestPaid: number;
    finalOwnerNetWorth: number;
    finalRenterNetWorth: number;
    renterTotalInitialContribution: number;
    renterTotalContinuousContribution: number;
    renterTotalInitialYield: number;
    renterTotalContinuousYield: number;
  };
}
