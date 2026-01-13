# Simulation Parameters

This document details the input parameters available in the Rent vs. Buy calculator. These parameters drive the financial simulation engine, allowing you to model various economic scenarios and personal financial situations.

## Household Income

These parameters define your earning capacity and tax obligations, which determine your net income and affordability.

*   **Gross Income**: Your total annual household income before taxes. This is the starting point for calculating your take-home pay and debt-to-income ratios.
*   **Federal Tax**: Your effective federal income tax rate. This is the percentage of your gross income that goes to the federal government. Note that this should be your *effective* rate (total tax / total income), not your marginal bracket.
*   **State Tax**: Your effective state income tax rate. Similar to the federal tax, this is the percentage of your gross income paid to the state.
*   **Income Growth**: The expected annual percentage increase in your household income. By default, this matches the inflation rate, assuming your purchasing power stays constant. Increasing this simulates career progression or raises above inflation.

## Property Basics

These inputs define the costs associated with purchasing and financing a home.

*   **Home Price**: The target purchase price of the property.
*   **Down Payment**: The percentage of the home price you intend to pay upfront in cash. The remaining amount will be financed via a mortgage.
*   **PMI Rate**: The annual rate for Private Mortgage Insurance. This is typically required if your down payment is less than 20%. It is calculated as a percentage of the original loan amount.
*   **Interest Rate**: The annual fixed interest rate on your mortgage. This determines your monthly principal and interest payments.
*   **Loan Term**: The duration of your mortgage in years (typically 15 or 30 years).

## Savings Discipline

These parameters control behavioral assumptions about how surplus cash is handled.

*   **Renter Discipline**: The percentage of "renter savings" that is actually invested. "Renter savings" is the difference between the monthly cost of buying (mortgage, tax, maintenance, etc.) and renting. If renting is cheaper, this parameter dictates how much of that difference gets invested into the stock market. 0% means you spend the difference; 100% means you diligently invest every penny.
*   **Owner Discipline**: The percentage of "owner savings" that is invested. If buying becomes cheaper than renting (usually in later years as rent rises while mortgage payments stay fixed), this dictates how much of that cash flow surplus the owner invests.

## Rental Market

These parameters forecast the cost of renting a comparable property.

*   **Monthly Rent**: The current monthly rent for a property similar to the one you are considering buying.
*   **Rent Inflation**: The expected annual percentage increase in rent. Rent typically increases with inflation or slightly higher in hot markets.
*   **Renters Insurance**: The monthly cost of renter's insurance to protect your personal property.

## Forecasts

These economic assumptions project future values over the simulation period.

*   **Home Appreciation**: The expected annual percentage increase in the home's value. This is a key driver of the owner's return on investment.
*   **Investment Return**: The expected annual nominal rate of return on your investment portfolio (e.g., stocks, bonds). This applies to the down payment (for the renter) and any monthly savings invested by either party.
*   **Inflation Rate**: The general annual inflation rate. This is used to adjust future values to "today's dollars" if the "Inflation Adjusted" toggle is enabled.
*   **Inflation Adjusted (Toggle)**: If enabled, all financial outputs (Net Worth, Cash Flow) are discounted back to Present Value terms using the Inflation Rate. This helps you understand the "real" purchasing power of future money.
*   **Property Tax**: The annual property tax rate, expressed as a percentage of the home's assessed value.
*   **CA Prop 13 (Toggle)**: If enabled, this simulates California's Proposition 13 tax rules. The assessed value for tax purposes is limited to a maximum 2% annual increase, regardless of the actual market appreciation of the home. This can significantly reduce tax burdens for long-term owners in high-appreciation areas.
*   **Maintenance**: The annual cost of home maintenance and repairs, expressed as a percentage of the home's value. Experts often recommend budgeting 1-2% annually.
