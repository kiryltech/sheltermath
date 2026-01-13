import { SimulationParams, OwnerMonthlyState } from './types';
import { calculateMonthlyGeometricRate } from './utils';

export function calculateOwnerSchedule(params: SimulationParams, monthlyMortgagePI: number, loanPrincipal: number): OwnerMonthlyState[] {
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
