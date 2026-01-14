import { SimulationParams, SimulationResult, AnnualFlows, MonthlyCashFlow, AnnualSnapshot } from './types';
import { setupSimulation } from './setup';
import { calculateMonthlyFinancials } from './monthly-logic';
import { initializeYearFlows, accumulateAnnualFlows } from './aggregator';

/**
 * Simulates the timeline for Buying vs Renting.
 */
export function simulateTimeline(params: SimulationParams): SimulationResult {
  const { simulationYears, grossIncome } = params;

  // 1. Setup Phase
  const {
    downPayment,
    monthlyInvestmentReturn,
    monthlyIncomeGrowth,
    monthlyDiscountRate,
    ownerSchedule,
    renterSchedule
  } = setupSimulation(params);

  // 2. Initialization Phase
  let currentGrossIncome = grossIncome;
  let ownerInvestmentPortfolio = 0;
  let renterInvestmentPortfolio = downPayment; // Renter invests the down payment

  // Track Renter Portfolio Components separately for detailed stats
  let renterInitialPortfolio = downPayment; // Tracks growth of initial down payment
  let renterContinuousPortfolio = 0; // Tracks growth of monthly savings
  let renterTotalContinuousContributionPV = 0; // Tracks total amount contributed (PV adjusted)

  const monthlyData: MonthlyCashFlow[] = [];
  const annualData: AnnualSnapshot[] = [];
  const annualFlows: AnnualFlows[] = [];

  // Detectors
  let crossoverDate: { year: number; totalMonths: number } | null = null;
  let monthlyPaymentCrossoverDate: { year: number; totalMonths: number } | null = null;
  let totalInterestPaid = 0;

  // Track aggregations for the current year
  // Initialize Year 1 with Down Payment flows
  let currentYearFlows: AnnualFlows = initializeYearFlows(1, {
      renterPortfolioContribution: downPayment,
      ownerPrincipalPaid: downPayment
  });

  // 3. Simulation Loop
  for (let i = 0; i < simulationYears * 12; i++) {
      const month = i + 1;
      const year = Math.ceil(month / 12);
      const owner = ownerSchedule[i];
      const renter = renterSchedule[i];

      // Reset annual flows if new year
      if (year > currentYearFlows.year) {
          annualFlows.push(currentYearFlows);
          currentYearFlows = initializeYearFlows(year);
      }

      // Calculate Financials for this month
      const result = calculateMonthlyFinancials({
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
      });

      // Update State
      ownerInvestmentPortfolio = result.newOwnerPortfolio;
      renterInvestmentPortfolio = result.newRenterPortfolio;

      // Update separate renter components
      // 1. Grow Initial Portfolio
      renterInitialPortfolio *= (1 + monthlyInvestmentReturn);
      // 2. Grow and Contribute to Continuous Portfolio
      renterContinuousPortfolio += result.renterContribution;
      renterContinuousPortfolio *= (1 + monthlyInvestmentReturn);
      // 3. Track Total Contribution (PV)
      renterTotalContinuousContributionPV += result.renterContribution * result.discountFactor;

      monthlyData.push(result.monthlyData);

      // Accumulate Flows
      currentYearFlows = accumulateAnnualFlows({
          currentFlows: currentYearFlows,
          monthlyData: result.monthlyData,
          owner,
          renter,
          ownerContribution: result.ownerContribution,
          renterContribution: result.renterContribution,
          ownerPortfolioGrowth: result.ownerPortfolioGrowth,
          renterPortfolioGrowth: result.renterPortfolioGrowth,
          taxSavings: result.taxSavings,
          discountFactor: result.discountFactor
      });

      // Accumulate Global Stats
      // Note: Interest paid is discounted in the loop usually?
      // In previous implementation: totalInterestPaid += owner.interestPayment * discountFactor;
      totalInterestPaid += owner.interestPayment * result.discountFactor;

      // Grow Income
      currentGrossIncome *= (1 + monthlyIncomeGrowth);

      // Check Crossovers
      const { ownerNetWorth, renterNetWorth, totalOwnerOutflow, totalRenterOutflow } = result.monthlyData; // These are discounted values

      // Crossover checks should probably happen on Real values?
      // In previous code:
      // if (!crossoverDate && ownerNetWorth > renterNetWorth) ...
      // Since both are discounted by same factor, comparison holds.

      // Wait, in previous code:
      // const diff = owner.totalOutflow - renter.totalOutflow; (Raw)
      // monthlyPaymentCrossoverDate based on `owner.totalOutflow <= renter.totalOutflow` (Raw)

      // In result.monthlyData, values are Discounted.
      // So we should check raw values for logic correctness if we want to match exact previous behavior,
      // OR rely on the fact that if A > B then A*k > B*k (for k > 0).
      // However, `monthlyPaymentCrossoverDate` used RAW values.

      if (!crossoverDate && ownerNetWorth > renterNetWorth) {
          crossoverDate = { year, totalMonths: month };
      }

      // Check adjusted outflows for monthly payment crossover
      const { totalOwnerOutflow: discountedOwnerOutflow, totalRenterOutflow: discountedRenterOutflow } = result.monthlyData;
      if (!monthlyPaymentCrossoverDate && discountedOwnerOutflow <= discountedRenterOutflow) {
          monthlyPaymentCrossoverDate = { year, totalMonths: month };
      }
  }

  // Push the last partial year (or full last year)
  if (monthlyData.length > 0) {
      annualFlows.push(currentYearFlows);
  }

  // 4. Generate Annual Snapshots
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

  // Calculate detailed renter metrics
  const lastMonthData = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null;
  const finalDF = params.inflationAdjusted ? (1 / Math.pow(1 + monthlyDiscountRate, monthlyData.length)) : 1;

  const renterTotalInitialContribution = downPayment; // At T=0, PV = Nominal
  const finalInitialPortfolioPV = renterInitialPortfolio * finalDF;
  const renterTotalInitialYield = finalInitialPortfolioPV - renterTotalInitialContribution;

  const finalContinuousPortfolioPV = renterContinuousPortfolio * finalDF;
  const renterTotalContinuousYield = finalContinuousPortfolioPV - renterTotalContinuousContributionPV;

  return {
    monthlyData,
    annualData,
    annualFlows,
    crossoverDate,
    monthlyPaymentCrossoverDate,
    summary: {
      totalInterestPaid,
      finalOwnerNetWorth: lastMonthData ? lastMonthData.ownerNetWorth : 0,
      finalRenterNetWorth: lastMonthData ? lastMonthData.renterNetWorth : 0,
      renterTotalInitialContribution,
      renterTotalContinuousContribution: renterTotalContinuousContributionPV,
      renterTotalInitialYield,
      renterTotalContinuousYield
    }
  };
}
