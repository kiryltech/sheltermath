import { SimulationParams, SimulationResult, AnnualFlows, MonthlyCashFlow, AnnualSnapshot } from './types';
import { calculateMonthlyPayments, calculateMonthlyGeometricRate } from './utils';
import { calculateOwnerSchedule } from './owner';
import { calculateRenterSchedule } from './renter';

/**
 * Simulates the timeline for Buying vs Renting.
 */
export function simulateTimeline(params: SimulationParams): SimulationResult {
  const {
    homePrice,
    downPaymentPercentage,
    mortgageRate,
    loanTermYears,
    investmentReturnRate,
    simulationYears,
    renterDiscipline = 100, // Default to 100 if undefined (though interface requires it)
    ownerDiscipline = 100,
    inflationAdjusted = false,
    grossIncome,
    federalTaxRate,
    stateTaxRate,
    incomeGrowthRate,
    inflationRate
  } = params;

  // Defaults
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

  // Calculate Investments and Net Worth
  let currentGrossIncome = grossIncome;
  let ownerInvestmentPortfolio = 0;
  // Renter invests the down payment
  let renterInvestmentPortfolio = downPayment;

  const monthlyData: MonthlyCashFlow[] = [];
  const annualData: AnnualSnapshot[] = [];
  const annualFlows: AnnualFlows[] = [];
  let crossoverDate: { year: number; totalMonths: number } | null = null;
  let monthlyPaymentCrossoverDate: { year: number; totalMonths: number } | null = null;
  let totalInterestPaid = 0;

  // Track aggregations for the current year
  // Initialize Year 1 with Down Payment flows
  let currentYearFlows: AnnualFlows = {
      year: 1,
      renterRent: 0,
      renterInsurance: 0,
      renterPortfolioContribution: downPayment, // Initial Investment
      renterPortfolioGrowth: 0,
      ownerPrincipalPaid: downPayment, // Initial Equity Purchase
      ownerInterestPaid: 0,
      ownerTax: 0,
      ownerInsurance: 0,
      ownerMaintenance: 0,
      ownerPMI: 0,
      ownerHomeAppreciation: 0,
      ownerPortfolioContribution: 0,
      ownerPortfolioGrowth: 0
  };

  for (let i = 0; i < simulationYears * 12; i++) {
      const month = i + 1;
      const year = Math.ceil(month / 12);
      const owner = ownerSchedule[i];
      const renter = renterSchedule[i];

      // Discount Factor
      // If inflationAdjusted is true, we discount back to time 0.
      // We use the month number to discount.
      // discountFactor = 1 / (1 + monthlyDiscountRate)^month
      const discountFactor = inflationAdjusted ? (1 / Math.pow(1 + monthlyDiscountRate, month)) : 1;

      // Reset annual flows if new year
      if (year > currentYearFlows.year) {
          annualFlows.push({ ...currentYearFlows });
          currentYearFlows = {
              year,
              renterRent: 0,
              renterInsurance: 0,
              renterPortfolioContribution: 0,
              renterPortfolioGrowth: 0,
              ownerPrincipalPaid: 0,
              ownerInterestPaid: 0,
              ownerTax: 0,
              ownerInsurance: 0,
              ownerMaintenance: 0,
              ownerPMI: 0,
              ownerHomeAppreciation: 0,
              ownerPortfolioContribution: 0,
              ownerPortfolioGrowth: 0
          };
      }

      // We discount the interest paid when summing up the total
      totalInterestPaid += owner.interestPayment * discountFactor;

      // Difference
      const diff = owner.totalOutflow - renter.totalOutflow;
      let investedAmount = 0;
      let renterContribution = 0;
      let ownerContribution = 0;

      if (diff > 0) {
          // Renter saves (Owner spends more)
          // Renter saves the difference * discipline
          const savings = diff;
          investedAmount = savings * (renterDiscipline / 100);
          renterInvestmentPortfolio += investedAmount;
          renterContribution = investedAmount;
      } else {
          // Owner saves (Renter spends more)
          // Owner saves the difference * discipline
          const savings = -diff;
          investedAmount = savings * (ownerDiscipline / 100);
          ownerInvestmentPortfolio += investedAmount;
          ownerContribution = investedAmount;
      }

      // Growth
      const ownerPortfolioBefore = ownerInvestmentPortfolio;
      ownerInvestmentPortfolio *= (1 + monthlyInvestmentReturn);
      const ownerPortfolioGrowth = ownerInvestmentPortfolio - ownerPortfolioBefore;

      const renterPortfolioBefore = renterInvestmentPortfolio;
      renterInvestmentPortfolio *= (1 + monthlyInvestmentReturn);
      const renterPortfolioGrowth = renterInvestmentPortfolio - renterPortfolioBefore;

      // Net Worth
      const ownerNetWorth = owner.realizableEquity + ownerInvestmentPortfolio;
      const renterNetWorth = renterInvestmentPortfolio;

      // Income & Budget Calculations
      const monthlyTax = currentGrossIncome * ((federalTaxRate + stateTaxRate) / 100) / 12;
      const monthlyNetIncome = (currentGrossIncome / 12) - monthlyTax;

      const lifestyleBudgetOwner = monthlyNetIncome - owner.totalOutflow - ownerContribution;
      const lifestyleBudgetRenter = monthlyNetIncome - renter.totalOutflow - renterContribution;

      const housingIncomeRatioOwner = (owner.totalOutflow / (currentGrossIncome / 12)) * 100;
      const housingIncomeRatioRenter = (renter.totalOutflow / (currentGrossIncome / 12)) * 100;

      // Accumulate Annual Flows (Apply Discount Factor)
      currentYearFlows.renterRent += renter.rentPayment * discountFactor;
      currentYearFlows.renterInsurance += renter.rentersInsurance * discountFactor;
      currentYearFlows.renterPortfolioContribution += renterContribution * discountFactor;
      currentYearFlows.renterPortfolioGrowth += renterPortfolioGrowth * discountFactor;

      currentYearFlows.ownerPrincipalPaid += owner.principalPayment * discountFactor;
      currentYearFlows.ownerInterestPaid += owner.interestPayment * discountFactor;
      currentYearFlows.ownerTax += owner.propertyTax * discountFactor;
      currentYearFlows.ownerInsurance += owner.homeInsurance * discountFactor;
      currentYearFlows.ownerMaintenance += owner.maintenanceCost * discountFactor;
      currentYearFlows.ownerPMI += owner.pmiPayment * discountFactor;
      currentYearFlows.ownerHomeAppreciation += owner.monthlyAppreciation * discountFactor;
      currentYearFlows.ownerPortfolioContribution += ownerContribution * discountFactor;
      currentYearFlows.ownerPortfolioGrowth += ownerPortfolioGrowth * discountFactor;

      // Record Data (Apply Discount Factor)
      monthlyData.push({
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
      });

      // Grow Income
      currentGrossIncome *= (1 + monthlyIncomeGrowth);

      if (!crossoverDate && ownerNetWorth > renterNetWorth) {
          crossoverDate = { year, totalMonths: month };
      }

      if (!monthlyPaymentCrossoverDate && owner.totalOutflow <= renter.totalOutflow) {
          monthlyPaymentCrossoverDate = { year, totalMonths: month };
      }
  }

  // Push the last partial year (or full last year)
  if (monthlyData.length > 0) {
      annualFlows.push(currentYearFlows);
  }

  // Generate Annual Data
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

  return {
    monthlyData,
    annualData,
    annualFlows,
    crossoverDate,
    monthlyPaymentCrossoverDate,
    summary: {
      totalInterestPaid,
      finalOwnerNetWorth: monthlyData[monthlyData.length - 1].ownerNetWorth,
      finalRenterNetWorth: monthlyData[monthlyData.length - 1].renterNetWorth
    }
  };
}
