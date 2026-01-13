import { MonthlyCashFlow, OwnerMonthlyState, RenterMonthlyState, SimulationParams } from './types';

export interface MonthlyFinancialsInput {
  params: SimulationParams;
  month: number;
  year: number;
  owner: OwnerMonthlyState;
  renter: RenterMonthlyState;
  currentGrossIncome: number;
  ownerInvestmentPortfolio: number;
  renterInvestmentPortfolio: number;
  monthlyInvestmentReturn: number;
  monthlyDiscountRate: number;
}

export interface MonthlyFinancialsResult {
  monthlyData: MonthlyCashFlow;
  newOwnerPortfolio: number;
  newRenterPortfolio: number;
  ownerContribution: number;
  renterContribution: number;
  ownerPortfolioGrowth: number;
  renterPortfolioGrowth: number;
  discountFactor: number;
}

export function calculateMonthlyFinancials(input: MonthlyFinancialsInput): MonthlyFinancialsResult {
  const {
    params,
    month,
    year,
    owner,
    renter,
    currentGrossIncome,
    ownerInvestmentPortfolio,
    renterInvestmentPortfolio,
    monthlyInvestmentReturn,
    monthlyDiscountRate
  } = input;

  const {
    renterDiscipline = 100,
    ownerDiscipline = 100,
    inflationAdjusted = false,
    federalTaxRate,
    stateTaxRate
  } = params;

  // Discount Factor
  const discountFactor = inflationAdjusted ? (1 / Math.pow(1 + monthlyDiscountRate, month)) : 1;

  // Difference
  const diff = owner.totalOutflow - renter.totalOutflow;
  let investedAmount = 0;
  let renterContribution = 0;
  let ownerContribution = 0;

  let currentRenterPortfolio = renterInvestmentPortfolio;
  let currentOwnerPortfolio = ownerInvestmentPortfolio;

  if (diff > 0) {
      // Renter saves (Owner spends more)
      const savings = diff;
      investedAmount = savings * (renterDiscipline / 100);
      currentRenterPortfolio += investedAmount;
      renterContribution = investedAmount;
  } else {
      // Owner saves (Renter spends more)
      const savings = -diff;
      investedAmount = savings * (ownerDiscipline / 100);
      currentOwnerPortfolio += investedAmount;
      ownerContribution = investedAmount;
  }

  // Growth
  const ownerPortfolioBefore = currentOwnerPortfolio;
  currentOwnerPortfolio *= (1 + monthlyInvestmentReturn);
  const ownerPortfolioGrowth = currentOwnerPortfolio - ownerPortfolioBefore;

  const renterPortfolioBefore = currentRenterPortfolio;
  currentRenterPortfolio *= (1 + monthlyInvestmentReturn);
  const renterPortfolioGrowth = currentRenterPortfolio - renterPortfolioBefore;

  // Net Worth
  const ownerNetWorth = owner.realizableEquity + currentOwnerPortfolio;
  const renterNetWorth = currentRenterPortfolio;

  // Income & Budget Calculations
  const monthlyTax = currentGrossIncome * ((federalTaxRate + stateTaxRate) / 100) / 12;
  const monthlyNetIncome = (currentGrossIncome / 12) - monthlyTax;

  const lifestyleBudgetOwner = monthlyNetIncome - owner.totalOutflow - ownerContribution;
  const lifestyleBudgetRenter = monthlyNetIncome - renter.totalOutflow - renterContribution;

  const housingIncomeRatioOwner = (owner.totalOutflow / (currentGrossIncome / 12)) * 100;
  const housingIncomeRatioRenter = (renter.totalOutflow / (currentGrossIncome / 12)) * 100;

  // Record Data (Apply Discount Factor)
  const monthlyData: MonthlyCashFlow = {
      month,
      year,
      mortgagePayment: owner.mortgagePayment * discountFactor,
      propertyTax: owner.propertyTax * discountFactor,
      homeInsurance: owner.homeInsurance * discountFactor,
      maintenanceCost: owner.maintenanceCost * discountFactor,
      pmiPayment: owner.pmiPayment * discountFactor,
      totalOwnerCosts: (owner.propertyTax + owner.homeInsurance + owner.maintenanceCost + owner.interestPayment + owner.pmiPayment) * discountFactor,
      totalOwnerOutflow: owner.totalOutflow * discountFactor,
      rentPayment: renter.rentPayment * discountFactor,
      rentersInsurance: renter.rentersInsurance * discountFactor,
      totalRenterOutflow: renter.totalOutflow * discountFactor,
      savings: Math.abs(diff) * discountFactor,
      investedAmount: investedAmount * discountFactor,
      ownerNetWorth: ownerNetWorth * discountFactor,
      renterNetWorth: renterNetWorth * discountFactor,
      grossIncome: (currentGrossIncome / 12) * discountFactor,
      netIncome: monthlyNetIncome * discountFactor,
      lifestyleBudgetRenter: lifestyleBudgetRenter * discountFactor,
      lifestyleBudgetOwner: lifestyleBudgetOwner * discountFactor,
      housingIncomeRatioOwner,
      housingIncomeRatioRenter
  };

  return {
    monthlyData,
    newOwnerPortfolio: currentOwnerPortfolio,
    newRenterPortfolio: currentRenterPortfolio,
    ownerContribution,
    renterContribution,
    ownerPortfolioGrowth,
    renterPortfolioGrowth,
    discountFactor
  };
}
