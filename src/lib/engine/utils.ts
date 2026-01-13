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
