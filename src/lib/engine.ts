
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
  incomeGrowthRate?: number; // Defaults to inflationRate if not provided

  // Simulation
  simulationYears: number;
  inflationAdjusted?: boolean;

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
  ownerPMI: number; // New field for PMI
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
    pmiPayment: number; // Added field
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
        homePrice,
        pmiRate = 0, // Default to 0 if not provided
        isProp13 = false
    } = params;

    // Use Geometric compounding for appreciation (Effective Annual Rate)
    const monthlyAppreciationRate = calculateMonthlyGeometricRate(homeAppreciationRate);
    // Use Arithmetic (APR) for Mortgage
    const monthlyRate = mortgageRate / 100 / 12;
    // Calculate Monthly PMI Amount (based on original loan amount)
    const monthlyPMI = (loanPrincipal * (pmiRate / 100)) / 12;

    // Prop 13: Assessed value grows by max 2% annually.
    const monthlyAssessedRate = calculateMonthlyGeometricRate(2.0);

    let currentHomeValue = homePrice;
    let assessedValue = homePrice;
    let remainingPrincipal = loanPrincipal;
    const schedule: OwnerMonthlyState[] = [];

    for (let month = 1; month <= simulationYears * 12; month++) {
        // Costs based on current home value (except tax if Prop 13)
        const taxBaseValue = isProp13 ? assessedValue : currentHomeValue;
        const monthlyPropertyTax = (taxBaseValue * (propertyTaxRate / 100)) / 12;

        const monthlyMaintenance = (currentHomeValue * (maintenanceCostPercentage / 100)) / 12;
        const monthlyHomeInsurance = (currentHomeValue * (homeInsuranceRate / 100)) / 12;

        // Mortgage
        let currentMortgagePayment = monthlyMortgagePI;
        let interestPayment = 0;
        let principalPayment = 0;
        let currentPMI = 0;

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

             // Check for PMI
             // Applies if LTV > 80% of ORIGINAL home value
             if (remainingPrincipal > (homePrice * 0.8)) {
                 currentPMI = monthlyPMI;
             }

             remainingPrincipal -= principalPayment;
             if (remainingPrincipal < 0) remainingPrincipal = 0;
        }

        const totalOutflow = currentMortgagePayment + monthlyPropertyTax + monthlyMaintenance + monthlyHomeInsurance + currentPMI;
        const realizableEquity = currentHomeValue * (1 - sellingCostPercentage / 100) - remainingPrincipal;

        // Appreciate home for next month
        const previousHomeValue = currentHomeValue;
        currentHomeValue *= (1 + monthlyAppreciationRate);
        const monthlyAppreciation = currentHomeValue - previousHomeValue;

        if (isProp13) {
            assessedValue *= (1 + monthlyAssessedRate);
        }

        schedule.push({
            mortgagePayment: currentMortgagePayment,
            propertyTax: monthlyPropertyTax,
            homeInsurance: monthlyHomeInsurance,
            maintenanceCost: monthlyMaintenance,
            pmiPayment: currentPMI,
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

    // Use Geometric compounding for Rent Inflation
    const monthlyRentInflation = calculateMonthlyGeometricRate(rentInflationRate);

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

        // Monthly inflation
        currentRent *= (1 + monthlyRentInflation);
        currentRentersInsurance *= (1 + monthlyRentInflation);
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

      const lifestyleBudgetOwner = monthlyNetIncome - owner.totalOutflow;
      const lifestyleBudgetRenter = monthlyNetIncome - renter.totalOutflow;

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
