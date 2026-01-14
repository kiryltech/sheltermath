import { SimulationParams, SimulationResult } from '../engine/types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function generateAnalysisPrompt(inputs: SimulationParams, results: SimulationResult): string {
  const inputsSummary = `
## Simulation Inputs

**Income & Taxes:**
- Gross Income: ${formatCurrency(inputs.grossIncome)}
- Federal Tax Rate: ${formatPercent(inputs.federalTaxRate)}
- State Tax Rate: ${formatPercent(inputs.stateTaxRate)}
- Income Growth Rate: ${formatPercent(inputs.incomeGrowthRate ?? inputs.inflationRate)}

**Housing (Buy):**
- Home Price: ${formatCurrency(inputs.homePrice)}
- Down Payment: ${inputs.downPaymentPercentage}%
- Mortgage Rate: ${formatPercent(inputs.mortgageRate)}
- Loan Term: ${inputs.loanTermYears} years
- Property Tax Rate: ${formatPercent(inputs.propertyTaxRate)}
- CA Prop 13: ${inputs.isProp13 ? 'Yes' : 'No'}
- Home Appreciation Rate: ${formatPercent(inputs.homeAppreciationRate)}

**Housing (Rent):**
- Monthly Rent: ${formatCurrency(inputs.monthlyRent)}
- Rent Inflation Rate: ${formatPercent(inputs.rentInflationRate)}
- Renter Discipline (Invest Difference): ${inputs.renterDiscipline}%

**Market:**
- Investment Return Rate: ${formatPercent(inputs.investmentReturnRate)}
- Inflation Rate: ${formatPercent(inputs.inflationRate)}
- Inflation Adjusted Results: ${inputs.inflationAdjusted ? 'Yes' : 'No'}
`;

  const resultsSummary = `
## Simulation Results Summary

- Final Owner Net Worth (Year ${inputs.simulationYears}): ${formatCurrency(results.summary.finalOwnerNetWorth)}
- Final Renter Net Worth (Year ${inputs.simulationYears}): ${formatCurrency(results.summary.finalRenterNetWorth)}
- Net Worth Difference: ${formatCurrency(results.summary.finalOwnerNetWorth - results.summary.finalRenterNetWorth)} (${results.summary.finalOwnerNetWorth > results.summary.finalRenterNetWorth ? 'Owner wins' : 'Renter wins'})
- Crossover Date: ${results.crossoverDate ? `Year ${results.crossoverDate.year}, Month ${results.crossoverDate.totalMonths % 12}` : 'Never'}
- Total Interest Paid: ${formatCurrency(results.summary.totalInterestPaid)}
`;

  // Sampled Annual Data Table
  let dataTable = `
## Annual Data (Sampled)

| Year | Owner Net Worth | Renter Net Worth | Owner Cash Flow | Renter Cash Flow |
|------|-----------------|------------------|-----------------|------------------|
`;

  results.annualData.forEach((yearData) => {
    // Find corresponding annual cash flow sum (approximate from monthly or if available)
    // We don't have annual cash flow sum directly in AnnualSnapshot, but we have monthlyData.
    // Let's aggregate from monthlyData for that year.
    const yearMonths = results.monthlyData.filter(m => m.year === yearData.year);
    const ownerCashFlow = yearMonths.reduce((sum, m) => sum + m.totalOwnerOutflow, 0);
    const renterCashFlow = yearMonths.reduce((sum, m) => sum + m.totalRenterOutflow, 0);

    dataTable += `| ${yearData.year} | ${formatCurrency(yearData.ownerNetWorth)} | ${formatCurrency(yearData.renterNetWorth)} | ${formatCurrency(ownerCashFlow)} | ${formatCurrency(renterCashFlow)} |\n`;
  });

  const promptTemplate = `
Hi Gemini, can you please play a role of financial advisor looking at the report of buy vs rent decision making for housing.

Things to pay close attention to:

1. Housing expense ratio. Highlight an unhealthy numbers.
2. Trends, see if the trajectory is sustainable or not.
3. Initial lump sum, compare to annual income, acknowledge a good savings habit if you see it.
4. Overall preparedness for retirement (in 30-35 years of the purchase).
5. Review the lifestyle budget and remember that essentials like food are still non optional and come out of that budget.

With this in mind please review this report dataset:

${inputsSummary}

${resultsSummary}

${dataTable}
`;

  return promptTemplate;
}
