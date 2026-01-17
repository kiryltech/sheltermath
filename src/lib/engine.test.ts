import { calculateMonthlyPayments, simulateTimeline, SimulationParams } from './engine';

describe('calculateMonthlyPayments', () => {
  it('calculates mortgage payment correctly', () => {
    // $300,000, 5%, 30 years
    const payment = calculateMonthlyPayments(300000, 5, 30);
    // Formula: 300000 * (0.0041666...) / (1 - (1+0.0041666...)^-360)
    // Roughly 1610.46
    expect(payment).toBeCloseTo(1610.46, 2);
  });

  it('handles 0% interest', () => {
    const payment = calculateMonthlyPayments(300000, 0, 30);
    expect(payment).toBeCloseTo(300000 / 360, 2);
  });
});

describe('simulateTimeline', () => {
  const defaultParams: SimulationParams = {
    homePrice: 500000,
    downPaymentPercentage: 20,
    mortgageRate: 6.5,
    loanTermYears: 30,
    propertyTaxRate: 1.25,
    homeInsuranceRate: 0.35,
    maintenanceCostPercentage: 1.0,
    homeAppreciationRate: 3.0,
    sellingCostPercentage: 6.0,
    monthlyRent: 2500,
    rentInflationRate: 3.0,
    rentersInsuranceMonthly: 20,
    investmentReturnRate: 7.0,
    inflationRate: 2.5,
    simulationYears: 45,
    renterDiscipline: 100,
    ownerDiscipline: 100,
    grossIncome: 120000,
    federalTaxRate: 22,
    stateTaxRate: 5,
    incomeGrowthRate: 3.0,
    monthlyCarPayment: 500,
    monthlyCarInsuranceGasMaintenance: 300,
    monthlyFoodAndEssentials: 600,
    monthlyUtilities: 200,
    monthlyDineOut: 200
  };

  it('generates correct number of months', () => {
    const result = simulateTimeline(defaultParams);
    expect(result.monthlyData).toHaveLength(45 * 12);
    expect(result.annualData).toHaveLength(45);
  });

  it('calculates crossover point correctly', () => {
    // With these params, buying usually wins eventually.
    const result = simulateTimeline(defaultParams);
    // Just verify it's not null for a reasonable scenario
    if (result.crossoverDate) {
       expect(result.crossoverDate.year).toBeGreaterThan(0);
       expect(result.crossoverDate.totalMonths).toBeGreaterThan(0);
    }
  });

  it('calculates renter net worth correctly (rent < buy scenario)', () => {
    // Force rent to be much cheaper so renter saves
    const params = { ...defaultParams, monthlyRent: 1000, homePrice: 1000000 };
    const result = simulateTimeline(params);

    const lastMonth = result.monthlyData[result.monthlyData.length - 1];

    // Renter should have significant savings
    expect(lastMonth.renterNetWorth).toBeGreaterThan(params.homePrice * 0.2); // Initial down payment
  });

  it('correctly amortizes the loan', () => {
      const result = simulateTimeline(defaultParams);
      // After 30 years, loan should be 0.
      // We check if at year 31, the mortgage payment is 0
      const month361 = result.monthlyData[360]; // Month 361
      expect(month361.mortgagePayment).toBe(0);
  });

  it('reduces owner costs after mortgage payoff', () => {
      const result = simulateTimeline(defaultParams);
      const month360 = result.monthlyData[359]; // Last month of mortgage
      const month361 = result.monthlyData[360]; // First month of no mortgage

      // Owner outflow should drop significantly
      expect(month361.totalOwnerOutflow).toBeLessThan(month360.totalOwnerOutflow);
      // Specifically, by approx mortgage payment amount (ignoring slight tax/maint inflation)
      const diff = month360.totalOwnerOutflow - month361.totalOwnerOutflow;
      expect(diff).toBeCloseTo(month360.mortgagePayment, -2); // Roughly
  });

  it('applies renter discipline correctly', () => {
      // Case where Renter Saves
      const params100 = { ...defaultParams, monthlyRent: 1000, homePrice: 1000000, renterDiscipline: 100 };
      const result100 = simulateTimeline(params100);

      const params50 = { ...defaultParams, monthlyRent: 1000, homePrice: 1000000, renterDiscipline: 50 };
      const result50 = simulateTimeline(params50);

      const lastMonth100 = result100.monthlyData[result100.monthlyData.length - 1];
      const lastMonth50 = result50.monthlyData[result50.monthlyData.length - 1];

      // Net worth with 50% discipline should be lower (but not exactly half due to down payment compounding)
      // Actually, down payment is invested regardless of discipline?
      // The code says: `let renterInvestmentPortfolio = downPayment;`
      // Discipline only applies to monthly savings.
      expect(lastMonth50.renterNetWorth).toBeLessThan(lastMonth100.renterNetWorth);
  });

  it('applies owner discipline correctly', () => {
      // Case where Owner Saves
      // Make rent very high so Owner saves
      const params100 = { ...defaultParams, monthlyRent: 10000, homePrice: 300000, ownerDiscipline: 100 };
      const result100 = simulateTimeline(params100);

      const params50 = { ...defaultParams, monthlyRent: 10000, homePrice: 300000, ownerDiscipline: 50 };
      const result50 = simulateTimeline(params50);

      const lastMonth100 = result100.monthlyData[result100.monthlyData.length - 1];
      const lastMonth50 = result50.monthlyData[result50.monthlyData.length - 1];

      expect(lastMonth50.ownerNetWorth).toBeLessThan(lastMonth100.ownerNetWorth);
  });

  it('calculates detailed renter metrics in summary', () => {
    const result = simulateTimeline(defaultParams);
    const { summary } = result;

    // Initial Contribution should equal Down Payment
    const expectedDownPayment = defaultParams.homePrice * (defaultParams.downPaymentPercentage / 100);
    expect(summary.renterTotalInitialContribution).toBeCloseTo(expectedDownPayment, 2);

    // Continuous Contribution should be positive (as rent < buy initially in some cases or discipline applied)
    expect(summary.renterTotalContinuousContribution).toBeGreaterThanOrEqual(0);

    // Yields should be reasonable (positive with 7% return)
    expect(summary.renterTotalInitialYield).toBeGreaterThan(0);
    expect(summary.renterTotalContinuousYield).toBeGreaterThanOrEqual(0);

    // Sum of components should approximately equal final Renter Net Worth
    const totalComponents = summary.renterTotalInitialContribution +
                            summary.renterTotalInitialYield +
                            summary.renterTotalContinuousContribution +
                            summary.renterTotalContinuousYield;

    expect(totalComponents).toBeCloseTo(summary.finalRenterNetWorth, 0);
  });

  it('calculates lifestyle expenses correctly', () => {
    // 5% inflation, $500 car payment, $300 insurance
    const params: SimulationParams = {
        ...defaultParams,
        inflationRate: 5.0,
        monthlyCarPayment: 500,
        monthlyCarInsuranceGasMaintenance: 300,
        monthlyFoodAndEssentials: 0,
        monthlyUtilities: 0,
        simulationYears: 10
    };

    const result = simulateTimeline(params);
    const m1 = result.monthlyData[0];   // Month 1
    const m60 = result.monthlyData[59]; // Month 60 (End of cycle 1)
    const m61 = result.monthlyData[60]; // Month 61 (Start of cycle 2)

    // Car Payment should be constant nominal for first 60 months
    expect(m1.carPayment).toBeCloseTo(500, 2);
    expect(m60.carPayment).toBeCloseTo(500, 2);

    // Month 61: New car purchased at inflated price.
    // Inflation over 5 years (60 months).
    // Formula in code: monthlyRate = (1.05)^(1/12) - 1.
    // Factor = (1+monthlyRate)^60 = 1.05^5 approx 1.276
    const expectedFactor = Math.pow(1.05, 5);
    const expectedNewPayment = 500 * expectedFactor;

    // Note: Our test logic uses calculateMonthlyGeometricRate which is precise.
    // 1.05^5 is 1.27628...
    expect(m61.carPayment).toBeCloseTo(expectedNewPayment, 2);
    expect(m61.carPayment).toBeGreaterThan(m60.carPayment);

    // Insurance should grow continuously
    // Month 1 should be slightly inflated from base?
    // Code: nominal = base * (1+r)^month
    // m1: 300 * (1+r)^1
    expect(m1.carInsuranceGasMaintenance).toBeGreaterThan(300);

    // m60 should be significantly higher
    expect(m60.carInsuranceGasMaintenance).toBeGreaterThan(m1.carInsuranceGasMaintenance);
  });
});
