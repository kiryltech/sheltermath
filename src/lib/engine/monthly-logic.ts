import { MonthlyCashFlow, OwnerMonthlyState, RenterMonthlyState, SimulationParams } from './types';

export interface MonthlyFinancialsInput {
  params: SimulationParams;
  month: number;
  year: number;
  owner: OwnerMonthlyState;
  renter: RenterMonthlyState;
  currentGrossIncome: number;
  currentAnnual401k: number;
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
  taxSavings: number;
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
    currentAnnual401k,
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
    stateTaxRate,
    itemizedDeductionRate = 0
  } = params;

  // Discount Factor
  const discountFactor = inflationAdjusted ? (1 / Math.pow(1 + monthlyDiscountRate, month)) : 1;

  // --- Tax Deduction Logic (Approximation) ---
  // We assume the user itemizes if they have a mortgage.
  // 1. SALT Cap: Property Tax deduction is capped at $10,000/year (approx $833/month).
  const SALT_CAP_MONTHLY = 10000 / 12;
  const deductiblePropertyTax = Math.min(owner.propertyTax, SALT_CAP_MONTHLY);
  
  // 2. Mortgage Interest is fully deductible (ignoring the $750k loan limit nuance for simplicity).
  const deductibleInterest = owner.interestPayment;

  // 3. Calculate Tax Savings: Deductions * Marginal Tax Rate * Usage Rate
  // itemizedDeductionRate (0-100%) allows user to toggle this benefit.
  // 0% = Standard Deduction (housing costs don't lower taxes relative to renting)
  // 100% = Full Itemization (every dollar of interest/tax reduces taxable income)
  const marginalTaxRate = (federalTaxRate + stateTaxRate) / 100;
  const potentialTaxSavings = (deductiblePropertyTax + deductibleInterest) * marginalTaxRate;
  const taxSavings = potentialTaxSavings * (itemizedDeductionRate / 100);

  // 4. Adjusted Owner Outflow
  // The "Real" cost of owning is the cash outflow minus the tax money you didn't have to pay.
  const adjustedOwnerOutflow = owner.totalOutflow - taxSavings;

  // 401k Logic
  const monthly401k = currentAnnual401k / 12;
  const taxableGrossIncomeMonthly = (currentGrossIncome / 12) - monthly401k;
  const monthlyTax = taxableGrossIncomeMonthly * ((federalTaxRate + stateTaxRate) / 100);
  // Net Income (excluding the tax savings, which effectively reduce the housing cost)
  // This is "Take Home" pay after Tax and 401k
  const monthlyNetIncome = (currentGrossIncome / 12) - monthlyTax - monthly401k;

  // Difference (Calculated using Post-Tax Post-401k money)
  // Logic: Both have `monthlyNetIncome` to spend.
  // Owner spends `adjustedOwnerOutflow`. Renter spends `renter.totalOutflow`.
  // The difference determines who has MORE disposable income (surplus) to invest.
  const diff = adjustedOwnerOutflow - renter.totalOutflow;
  let surplusInvested = 0;
  let renterSurplusContribution = 0;
  let ownerSurplusContribution = 0;

  let currentRenterPortfolio = renterInvestmentPortfolio;
  let currentOwnerPortfolio = ownerInvestmentPortfolio;

  // Add 401k to portfolios immediately (it's pre-tax savings)
  currentRenterPortfolio += monthly401k;
  currentOwnerPortfolio += monthly401k;

  if (diff > 0) {
      // Renter saves (Owner spends more)
      // Since Owner costs > Renter costs, Renter has 'diff' more cash available from Net Income.
      const savings = diff;
      surplusInvested = savings * (renterDiscipline / 100);
      currentRenterPortfolio += surplusInvested;
      renterSurplusContribution = surplusInvested;
  } else {
      // Owner saves (Renter spends more)
      const savings = -diff;
      surplusInvested = savings * (ownerDiscipline / 100);
      currentOwnerPortfolio += surplusInvested;
      ownerSurplusContribution = surplusInvested;
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

  // Budget: For Owner, we use the ADJUSTED outflow.
  // Note: We don't add taxSavings to income; we subtracted it from the "Bill". Same net effect.
  // 401k is already deducted from monthlyNetIncome, so we only subtract the surplus contribution.
  const lifestyleBudgetOwner = monthlyNetIncome - adjustedOwnerOutflow - ownerSurplusContribution;
  const lifestyleBudgetRenter = monthlyNetIncome - renter.totalOutflow - renterSurplusContribution;

  const housingIncomeRatioOwner = (adjustedOwnerOutflow / (currentGrossIncome / 12)) * 100;
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
      totalOwnerCosts: (owner.propertyTax + owner.homeInsurance + owner.maintenanceCost + owner.interestPayment + owner.pmiPayment - taxSavings) * discountFactor,
      totalOwnerOutflow: adjustedOwnerOutflow * discountFactor,
      rentPayment: renter.rentPayment * discountFactor,
      rentersInsurance: renter.rentersInsurance * discountFactor,
      totalRenterOutflow: renter.totalOutflow * discountFactor,
      savings: Math.abs(diff) * discountFactor,
      investedAmount: surplusInvested * discountFactor,
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
    ownerContribution: ownerSurplusContribution + monthly401k,
    renterContribution: renterSurplusContribution + monthly401k,
    ownerPortfolioGrowth,
    renterPortfolioGrowth,
    taxSavings: taxSavings * discountFactor,
    discountFactor
  };
}
