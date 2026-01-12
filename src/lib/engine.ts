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

  // Rental
  monthlyRent: number;
  rentInflationRate: number; // Annual percentage
  rentersInsuranceMonthly: number;

  // Market
  investmentReturnRate: number; // Annual percentage (e.g., 7 for 7%)
  inflationRate: number; // Annual percentage (general inflation)

  // Simulation
  simulationYears: number;
}

export interface MonthlyCashFlow {
  month: number;
  year: number;

  // Buying Costs
  mortgagePayment: number; // P&I (Fixed)
  propertyTax: number;
  homeInsurance: number; // (Usually part of escrow, but let's assume included in maintenance or separate? Design doc says: Tax + Insurance + Maintenance)
                         // Wait, design doc says "Owner Cost: Mortgage (P&I) + Tax + Insurance + Maintenance".
                         // I missed homeInsurance in params. I should add it or assume it's part of maintenance/tax.
                         // Let's stick to design doc: "Tax + Insurance + Maintenance".
                         // Params in design doc: "Property Tax Rate", "Maintenance Costs". No explicit Home Insurance input in design doc params list?
                         // "Tax + Insurance + Maintenance" is listed in Cash Flow Calculation.
                         // "Property Tax Rate (%)" and "Maintenance Costs (% of value)" are in Input Parameters.
                         // Missing "Home Owners Insurance". I will add it to params.
  maintenanceCost: number;
  totalOwnerCosts: number; // Unrecoverable costs? Or total cash outflow?
                           // Design doc: "Cash Flow Chart... Line A (Buy): Starts high... (only tax/maint creep up)."
                           // This implies Line A is Total Monthly Outflow.
  totalOwnerOutflow: number; // P&I + Tax + Maint + Insurance.

  // Renting Costs
  rentPayment: number;
  rentersInsurance: number;
  totalRenterOutflow: number;

  // Difference
  savings: number; // Absolute difference |OwnerOutflow - RenterOutflow|
  investedAmount: number; // The amount added to investment pool this month.
  ownerNetWorth: number;
  renterNetWorth: number;
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
  crossoverDate: { year: number; month: number } | null;
  summary: {
    totalInterestPaid: number;
    finalOwnerNetWorth: number;
    finalRenterNetWorth: number;
  };
}

/**
 * Calculates the monthly mortgage payment (Principal + Interest).
 * Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
 * P = Principal loan amount
 * i = Monthly interest rate
 * n = Number of months required to repay the loan
 */
export function calculateMonthlyPayments(principal: number, annualRate: number, years: number): number {
  if (annualRate === 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

/**
 * Simulates the timeline for Buying vs Renting.
 */
export function simulateTimeline(params: SimulationParams): SimulationResult {
  const {
    homePrice,
    downPaymentPercentage,
    mortgageRate,
    loanTermYears,
    propertyTaxRate,
    homeInsuranceRate,
    maintenanceCostPercentage,
    homeAppreciationRate,
    sellingCostPercentage,
    monthlyRent,
    rentInflationRate,
    rentersInsuranceMonthly,
    investmentReturnRate,
    simulationYears,
  } = params;

  // Initial calculations
  const downPayment = homePrice * (downPaymentPercentage / 100);
  const loanPrincipal = homePrice - downPayment;
  const monthlyMortgagePI = calculateMonthlyPayments(loanPrincipal, mortgageRate, loanTermYears);

  // Monthly rates
  const monthlyAppreciationRate = homeAppreciationRate / 100 / 12;
  const monthlyInvestmentReturn = investmentReturnRate / 100 / 12;

  let currentHomeValue = homePrice;
  let currentRent = monthlyRent;
  let currentRentersInsurance = rentersInsuranceMonthly;

  let ownerInvestmentPortfolio = 0;
  // Renter invests the down payment they didn't spend on the house.
  // Ideally, this should also include the buyer's closing costs (approx 2-5%),
  // but since that's not an input param, we start with just the down payment.
  let renterInvestmentPortfolio = downPayment;

  let remainingPrincipal = loanPrincipal;

  const monthlyData: MonthlyCashFlow[] = [];
  const annualData: AnnualSnapshot[] = [];

  let crossoverDate: { year: number; month: number } | null = null;
  let totalInterestPaid = 0;

  for (let month = 1; month <= simulationYears * 12; month++) {
    const year = Math.ceil(month / 12);

    // --- BUYER COSTS ---
    // P&I is fixed
    // Tax, Maint, Insurance are monthly values
    // Assuming Tax/Maint/Ins are % of Current Home Value.
    // Note: If they inflate annually, we might update them only at year start.
    // "Tax/Ins/Maint inflate annually".
    // I will use the value at the start of the year or update monthly.
    // Let's update monthly based on current home value for smoothness, or keep flat for the year?
    // "Inflate annually" suggests step function.
    // But appreciation is usually modeled continuously or annually.
    // Let's use continuous appreciation for home value, and calculate costs based on that.

    // Actually, tax is usually based on assessed value.
    // To match "Inflate annually", I should probably increase the cost by inflation or appreciation once a year.
    // However, simplicity: Calculate as % of current home value.
    // Wait, if I do % of home value, and home value appreciates, then costs appreciate.

    const monthlyPropertyTax = (currentHomeValue * (propertyTaxRate / 100)) / 12;
    const monthlyMaintenance = (currentHomeValue * (maintenanceCostPercentage / 100)) / 12;
    const monthlyHomeInsurance = (currentHomeValue * (homeInsuranceRate / 100)) / 12;

    const totalOwnerOutflow = monthlyMortgagePI + monthlyPropertyTax + monthlyMaintenance + monthlyHomeInsurance;

    // --- RENTER COSTS ---
    const totalRenterOutflow = currentRent + currentRentersInsurance;

    // --- INVEST THE DIFFERENCE ---
    const savings = Math.abs(totalOwnerOutflow - totalRenterOutflow);

    if (totalRenterOutflow < totalOwnerOutflow) {
      // Rent is cheaper. Renter invests savings.
      renterInvestmentPortfolio += savings;
    } else {
      // Buy is cheaper. Owner invests savings.
      ownerInvestmentPortfolio += savings;
    }

    // --- INVESTMENT GROWTH ---
    // Apply monthly return
    ownerInvestmentPortfolio *= (1 + monthlyInvestmentReturn);
    renterInvestmentPortfolio *= (1 + monthlyInvestmentReturn);

    // --- MORTGAGE AMORTIZATION ---
    const interestPayment = remainingPrincipal * (mortgageRate / 100 / 12);
    let principalPayment = monthlyMortgagePI - interestPayment;
    if (remainingPrincipal < principalPayment) {
        principalPayment = remainingPrincipal;
    }

    if (remainingPrincipal > 0) {
        remainingPrincipal -= principalPayment;
        totalInterestPaid += interestPayment;
    }

    // --- TRACKING ---
    // Owner Net Worth = (Home Value - Selling Costs - Remaining Principal) + Investments
    // Selling costs (e.g. 6%) are important for "Real" Net Worth.
    // const equity = currentHomeValue - remainingPrincipal; // Unused
    const realizableEquity = currentHomeValue * (1 - sellingCostPercentage/100) - remainingPrincipal;
    const ownerNetWorth = realizableEquity + ownerInvestmentPortfolio;

    const renterNetWorth = renterInvestmentPortfolio;

    monthlyData.push({
      month,
      year,
      mortgagePayment: monthlyMortgagePI,
      propertyTax: monthlyPropertyTax,
      homeInsurance: monthlyHomeInsurance,
      maintenanceCost: monthlyMaintenance,
      totalOwnerCosts: monthlyPropertyTax + monthlyHomeInsurance + monthlyMaintenance + interestPayment, // Unrecoverable?
      totalOwnerOutflow,
      rentPayment: currentRent,
      rentersInsurance: currentRentersInsurance,
      totalRenterOutflow,
      savings,
      investedAmount: savings,
      ownerNetWorth,
      renterNetWorth
    });

    if (!crossoverDate && ownerNetWorth > renterNetWorth) {
      crossoverDate = { year, month };
    }

    // --- UPDATES FOR NEXT MONTH ---
    // Appreciate Home
    currentHomeValue *= (1 + monthlyAppreciationRate);

    // Inflate Rent & Renter Insurance (Annually? or Monthly?)
    // "Rent Inflation Rate" usually annual.
    // "Inflates annually" -> step change at month 13, 25, etc.
    if (month % 12 === 0) {
        currentRent *= (1 + rentInflationRate / 100);
        currentRentersInsurance *= (1 + rentInflationRate / 100); // Assuming same inflation
    }
  }

  // Annual Snapshots (End of each year)
  for (let y = 1; y <= simulationYears; y++) {
    const monthIndex = y * 12 - 1;
    if (monthIndex < monthlyData.length) {
      const datum = monthlyData[monthIndex];
      annualData.push({
        year: datum.year,
        ownerNetWorth: datum.ownerNetWorth,
        renterNetWorth: datum.renterNetWorth,
        crossover: datum.ownerNetWorth > datum.renterNetWorth
      });
    }
  }

  // Re-run loop or better: Add net worth to MonthlyCashFlow
  // I will add net worth fields to MonthlyCashFlow.

  return {
    monthlyData, // Updated interface needed
    annualData, // Need to populate
    crossoverDate,
    summary: {
      totalInterestPaid,
      finalOwnerNetWorth: monthlyData[monthlyData.length - 1].ownerNetWorth,
      finalRenterNetWorth: monthlyData[monthlyData.length - 1].renterNetWorth
    }
  };
}
