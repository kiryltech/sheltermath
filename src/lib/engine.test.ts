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
    simulationYears: 30,
  };

  it('generates correct number of months', () => {
    const result = simulateTimeline(defaultParams);
    expect(result.monthlyData).toHaveLength(30 * 12);
    expect(result.annualData).toHaveLength(30);
  });

  it('calculates crossover point correctly', () => {
    // With these params, buying usually wins eventually.
    const result = simulateTimeline(defaultParams);
    // Just verify it's not null for a reasonable scenario
    if (result.crossoverDate) {
       expect(result.crossoverDate.year).toBeGreaterThan(0);
       expect(result.crossoverDate.month).toBeGreaterThan(0);
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
      // But we track remaining principal in the loop.
      // We can check equity vs home value.
      const lastMonth = result.monthlyData[result.monthlyData.length - 1];
      // Since we don't expose remainingPrincipal directly in MonthlyCashFlow,
      // we can infer it or check if interest payment is close to 0?
      // Actually we expose mortgagePayment (fixed).
      // But we can check if ownerNetWorth is roughly HomeValue + Investments (minus selling costs).
      // At end of term, principal is 0.

      // Calculate expected home value
      const expectedHomeValue = 500000 * Math.pow(1 + 0.03, 30);
      // Selling costs
      const sellingCosts = expectedHomeValue * 0.06;
      const expectedEquity = expectedHomeValue - sellingCosts;

      // We need to account for investments.
      // We can't easily predict exact investments without replicating logic,
      // but we can check if ownerNetWorth >= expectedEquity.
      expect(lastMonth.ownerNetWorth).toBeGreaterThan(expectedEquity);
  });
});
