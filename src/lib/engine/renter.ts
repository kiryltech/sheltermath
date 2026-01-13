import { SimulationParams } from './types';
import { calculateMonthlyGeometricRate } from './utils';

export interface RenterMonthlyState {
    rentPayment: number;
    rentersInsurance: number;
    totalOutflow: number;
}

export function calculateRenterSchedule(params: SimulationParams): RenterMonthlyState[] {
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
