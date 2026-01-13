
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

  // Discipline
  renterDiscipline: number; // Percentage (0-100) of excess cash invested
  ownerDiscipline: number; // Percentage (0-100) of excess cash invested
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
  totalOwnerCosts: number; // Unrecoverable costs + Interest? No, typically total outflow for cash flow comparison.
                           // Let's stick to Total Monthly Outflow for this field to match charts usually.
  totalOwnerOutflow: number; // P&I + Tax + Maint + Insurance.

  // Renting Costs
  rentPayment: number;
  rentersInsurance: number;
  totalRenterOutflow: number;

  // Difference
  savings: number; // Absolute difference |OwnerOutflow - RenterOutflow|
  investedAmount: number; // The amount added to investment pool this month (after discipline).
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
  annualFlows: AnnualFlows[];
  crossoverDate: { year: number; month: number } | null;
  summary: {
    totalInterestPaid: number;
    finalOwnerNetWorth: number;
    finalRenterNetWorth: number;
  };
}

/**
 * Calculates the monthly mortgage payment (Principal + Interest).
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
 * Calculates the monthly geometric rate from an annual rate.
 * Formula: (1 + annualRate)^(1/12) - 1
 */
export function calculateMonthlyGeometricRate(annualRate: number): number {
    if (annualRate === 0) return 0;
    return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

interface OwnerMonthlyState {
    mortgagePayment: number;
    propertyTax: number;
    homeInsurance: number;
    maintenanceCost: number;
    totalOutflow: number;
    interestPayment: number;
    principalPayment: number;
    remainingPrincipal: number;
    homeValue: number;
    realizableEquity: number;
    monthlyAppreciation: number;
}

interface RenterMonthlyState {
    rentPayment: number;
    rentersInsurance: number;
    totalOutflow: number;
}

function calculateOwnerSchedule(params: SimulationParams, monthlyMortgagePI: number, loanPrincipal: number): OwnerMonthlyState[] {
    const {
        loanTermYears,
        propertyTaxRate,
        homeInsuranceRate,
        maintenanceCostPercentage,
        homeAppreciationRate,
        sellingCostPercentage,
        mortgageRate,
        simulationYears,
        homePrice
    } = params;

    // Use Geometric compounding for appreciation (Effective Annual Rate)
    const monthlyAppreciationRate = calculateMonthlyGeometricRate(homeAppreciationRate);
    // Use Arithmetic (APR) for Mortgage
    const monthlyRate = mortgageRate / 100 / 12;

    let currentHomeValue = homePrice;
    let remainingPrincipal = loanPrincipal;
    const schedule: OwnerMonthlyState[] = [];

    for (let month = 1; month <= simulationYears * 12; month++) {
        // Costs based on current home value
        const monthlyPropertyTax = (currentHomeValue * (propertyTaxRate / 100)) / 12;
        const monthlyMaintenance = (currentHomeValue * (maintenanceCostPercentage / 100)) / 12;
        const monthlyHomeInsurance = (currentHomeValue * (homeInsuranceRate / 100)) / 12;

        // Mortgage
        let currentMortgagePayment = monthlyMortgagePI;
        let interestPayment = 0;
        let principalPayment = 0;

        if (month > loanTermYears * 12) {
            currentMortgagePayment = 0;
            interestPayment = 0;
            principalPayment = 0;
            remainingPrincipal = 0; // Should be 0 already
        } else {
             interestPayment = remainingPrincipal * monthlyRate;
             principalPayment = currentMortgagePayment - interestPayment;

             // Handle final payment dust
             if (remainingPrincipal < principalPayment) {
                 principalPayment = remainingPrincipal;
                 // Adjust mortgage payment for last month? Usually kept constant, but principal drops.
                 // To be precise:
                 // currentMortgagePayment = principalPayment + interestPayment;
             }
             remainingPrincipal -= principalPayment;
             if (remainingPrincipal < 0) remainingPrincipal = 0;
        }

        const totalOutflow = currentMortgagePayment + monthlyPropertyTax + monthlyMaintenance + monthlyHomeInsurance;
        const realizableEquity = currentHomeValue * (1 - sellingCostPercentage / 100) - remainingPrincipal;

        // Appreciate home for next month
        const previousHomeValue = currentHomeValue;
        currentHomeValue *= (1 + monthlyAppreciationRate);
        const monthlyAppreciation = currentHomeValue - previousHomeValue;

        schedule.push({
            mortgagePayment: currentMortgagePayment,
            propertyTax: monthlyPropertyTax,
            homeInsurance: monthlyHomeInsurance,
            maintenanceCost: monthlyMaintenance,
            totalOutflow,
            interestPayment,
            principalPayment,
            remainingPrincipal,
            homeValue: previousHomeValue,
            realizableEquity,
            monthlyAppreciation: monthlyAppreciation // Appreciation that happens *after* this month (or during)
        });
    }
    return schedule;
}

function calculateRenterSchedule(params: SimulationParams): RenterMonthlyState[] {
    const {
        monthlyRent,
        rentInflationRate,
        rentersInsuranceMonthly,
        simulationYears
    } = params;

    let currentRent = monthlyRent;
    let currentRentersInsurance = rentersInsuranceMonthly;
    const schedule: RenterMonthlyState[] = [];

    for (let month = 1; month <= simulationYears * 12; month++) {
        const totalOutflow = currentRent + currentRentersInsurance;

        schedule.push({
            rentPayment: currentRent,
            rentersInsurance: currentRentersInsurance,
            totalOutflow
        });

        // Annual inflation
        if (month % 12 === 0) {
            currentRent *= (1 + rentInflationRate / 100);
            currentRentersInsurance *= (1 + rentInflationRate / 100);
        }
    }
    return schedule;
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
    investmentReturnRate,
    simulationYears,
    renterDiscipline = 100, // Default to 100 if undefined (though interface requires it)
    ownerDiscipline = 100
  } = params;

  // Initial calculations
  const downPayment = homePrice * (downPaymentPercentage / 100);
  const loanPrincipal = homePrice - downPayment;
  const monthlyMortgagePI = calculateMonthlyPayments(loanPrincipal, mortgageRate, loanTermYears);

  // Use Geometric compounding for Investment Return (Effective Annual Rate)
  const monthlyInvestmentReturn = calculateMonthlyGeometricRate(investmentReturnRate);

  // Generate Schedules
  const ownerSchedule = calculateOwnerSchedule(params, monthlyMortgagePI, loanPrincipal);
  const renterSchedule = calculateRenterSchedule(params);

  // Calculate Investments and Net Worth
  let ownerInvestmentPortfolio = 0;
  // Renter invests the down payment
  let renterInvestmentPortfolio = downPayment;

  const monthlyData: MonthlyCashFlow[] = [];
  const annualData: AnnualSnapshot[] = [];
  const annualFlows: AnnualFlows[] = [];
  let crossoverDate: { year: number; month: number } | null = null;
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
      ownerHomeAppreciation: 0,
      ownerPortfolioContribution: 0,
      ownerPortfolioGrowth: 0
  };

  for (let i = 0; i < simulationYears * 12; i++) {
      const month = i + 1;
      const year = Math.ceil(month / 12);
      const owner = ownerSchedule[i];
      const renter = renterSchedule[i];

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
              ownerHomeAppreciation: 0,
              ownerPortfolioContribution: 0,
              ownerPortfolioGrowth: 0
          };
      }

      totalInterestPaid += owner.interestPayment;

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

      // Accumulate Annual Flows
      currentYearFlows.renterRent += renter.rentPayment;
      currentYearFlows.renterInsurance += renter.rentersInsurance;
      currentYearFlows.renterPortfolioContribution += renterContribution;
      currentYearFlows.renterPortfolioGrowth += renterPortfolioGrowth;

      currentYearFlows.ownerPrincipalPaid += owner.principalPayment;
      currentYearFlows.ownerInterestPaid += owner.interestPayment;
      currentYearFlows.ownerTax += owner.propertyTax;
      currentYearFlows.ownerInsurance += owner.homeInsurance;
      currentYearFlows.ownerMaintenance += owner.maintenanceCost;
      currentYearFlows.ownerHomeAppreciation += owner.monthlyAppreciation;
      currentYearFlows.ownerPortfolioContribution += ownerContribution;
      currentYearFlows.ownerPortfolioGrowth += ownerPortfolioGrowth;

      // Record Data
      monthlyData.push({
          month,
          year,
          mortgagePayment: owner.mortgagePayment,
          propertyTax: owner.propertyTax,
          homeInsurance: owner.homeInsurance,
          maintenanceCost: owner.maintenanceCost,
          totalOwnerCosts: owner.propertyTax + owner.homeInsurance + owner.maintenanceCost + owner.interestPayment, // Roughly unrecoverable costs
          totalOwnerOutflow: owner.totalOutflow,
          rentPayment: renter.rentPayment,
          rentersInsurance: renter.rentersInsurance,
          totalRenterOutflow: renter.totalOutflow,
          savings: Math.abs(diff),
          investedAmount, // This is the amount actually invested (after discipline)
          ownerNetWorth,
          renterNetWorth
      });

      if (!crossoverDate && ownerNetWorth > renterNetWorth) {
          crossoverDate = { year, month };
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
    summary: {
      totalInterestPaid,
      finalOwnerNetWorth: monthlyData[monthlyData.length - 1].ownerNetWorth,
      finalRenterNetWorth: monthlyData[monthlyData.length - 1].renterNetWorth
    }
  };
}
