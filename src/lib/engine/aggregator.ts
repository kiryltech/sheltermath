import { AnnualFlows, MonthlyCashFlow, OwnerMonthlyState, RenterMonthlyState } from './types';

export function initializeYearFlows(year: number, initialValues?: Partial<AnnualFlows>): AnnualFlows {
    return {
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
        ownerTaxSavings: 0,
        ownerHomeAppreciation: 0,
        ownerPortfolioContribution: 0,
        ownerPortfolioGrowth: 0,
        ...initialValues
    };
}

export interface AccumulationInput {
    currentFlows: AnnualFlows;
    monthlyData: MonthlyCashFlow; // Note: monthlyData is already discounted
    owner: OwnerMonthlyState;
    renter: RenterMonthlyState;
    ownerContribution: number;
    renterContribution: number;
    ownerPortfolioGrowth: number;
    renterPortfolioGrowth: number;
    taxSavings: number; // Already discounted from monthly-logic
    discountFactor: number;
}

export function accumulateAnnualFlows(input: AccumulationInput): AnnualFlows {
    const {
        currentFlows,
        monthlyData, // We use monthlyData for values that are directly passed through, but for components we might need raw or discounted values.
        owner,
        renter,
        ownerContribution,
        renterContribution,
        ownerPortfolioGrowth,
        renterPortfolioGrowth,
        taxSavings,
        discountFactor
    } = input;

    // We can assume inputs like ownerContribution are RAW values if we apply discountFactor here.
    // However, in monthly-logic.ts, `monthlyData` fields ARE discounted.
    // The `ownerContribution` passed back from calculateMonthlyFinancials is RAW.
    // The `owner` and `renter` states are RAW.

    return {
        ...currentFlows,
        renterRent: currentFlows.renterRent + (renter.rentPayment * discountFactor),
        renterInsurance: currentFlows.renterInsurance + (renter.rentersInsurance * discountFactor),
        renterPortfolioContribution: currentFlows.renterPortfolioContribution + (renterContribution * discountFactor),
        renterPortfolioGrowth: currentFlows.renterPortfolioGrowth + (renterPortfolioGrowth * discountFactor),

        ownerPrincipalPaid: currentFlows.ownerPrincipalPaid + (owner.principalPayment * discountFactor),
        ownerInterestPaid: currentFlows.ownerInterestPaid + (owner.interestPayment * discountFactor),
        ownerTax: currentFlows.ownerTax + (owner.propertyTax * discountFactor),
        ownerInsurance: currentFlows.ownerInsurance + (owner.homeInsurance * discountFactor),
        ownerMaintenance: currentFlows.ownerMaintenance + (owner.maintenanceCost * discountFactor),
        ownerPMI: currentFlows.ownerPMI + (owner.pmiPayment * discountFactor),
        ownerTaxSavings: currentFlows.ownerTaxSavings + taxSavings,
        ownerHomeAppreciation: currentFlows.ownerHomeAppreciation + (owner.monthlyAppreciation * discountFactor),
        ownerPortfolioContribution: currentFlows.ownerPortfolioContribution + (ownerContribution * discountFactor),
        ownerPortfolioGrowth: currentFlows.ownerPortfolioGrowth + (ownerPortfolioGrowth * discountFactor)
    };
}
