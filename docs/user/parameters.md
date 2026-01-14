# Simulation Parameters

This guide explains the inputs for the Rent vs. Buy calculator. Use these settings to model your specific financial scenario.

## 🏠 Purchase Details
*The cost of the home you want to buy.*

*   **Home Price**
    The purchase price of the property.

*   **Down Payment**
    Percentage of the price paid upfront in cash.
    *   *Tip:* Values < 20% typically trigger PMI.

*   **PMI Rate**
    Annual cost of [Private Mortgage Insurance](https://www.investopedia.com/terms/p/insurance.asp) (if Down Payment < 20%). Calculated on the loan amount.

*   **Interest Rate**
    Annual fixed interest rate for the mortgage.

*   **Loan Term**
    Length of the mortgage (e.g., 30 Years).

---

## 🏢 Rental Comparison
*The alternative scenario.*

*   **Monthly Rent**
    Current rent for a home comparable to the one you might buy.

*   **Renters Insurance**
    Monthly cost to insure your personal property while renting.

---

## 🧾 Recurring Home Costs
*Ongoing expenses of homeownership beyond the mortgage.*

*   **Property Tax**
    Annual tax as a % of the home's assessed value.

*   **CA Prop 13 (Toggle)**
    *   **On**: Limits assessed value growth to 2% per year ([California Proposition 13](https://en.wikipedia.org/wiki/1978_California_Proposition_13)).
    *   **Off**: Assessed value grows with Home Appreciation.

*   **Home Insurance**
    Annual insurance cost as a % of the home value.

*   **Maintenance**
    Annual cost for repairs/upkeep as a % of home value.
    *   *Rule of Thumb:* 1.0% per year.

---

## 💰 Income & Taxes
*Defines your earning power and tax situation.*

*   **Gross Income**
    Total annual household income before taxes. Used to calculate monthly net income and affordability ratios.

*   **Federal Tax Rate**
    Your *effective* federal income tax rate (Total Tax ÷ Total Income). This is usually lower than your [marginal tax bracket](https://www.investopedia.com/ask/answers/05/marginaltaxrate.asp).

*   **State Tax Rate**
    Your *effective* state income tax rate.

*   **Deduction Capture**
    Percentage of housing costs (Mortgage Interest + Property Tax) you claim on taxes.
    *   **0% (Standard)**: You take the Standard Deduction (Housing has no tax benefit).
    *   **100% (Full)**: You Itemize (Full tax benefit).
    *   *Note:* The calculator respects the [\$10k SALT cap](https://www.investopedia.com/terms/s/salt-tax-deduction.asp) automatically.

---

## 📈 Market Assumptions
*Economic predictions and future growth rates.*

*   **Home Appreciation**
    Annual % growth in the home's value.

*   **Rent Inflation**
    Annual % increase in rent.
    *   *Tip:* Historical average is often near inflation (3-4%), but hot markets can be much higher.

*   **Income Growth**
    Annual % increase in salary.
    *   *Default:* Matches inflation (purchasing power stays flat).
    *   *Tip:* Increase this if you expect significant career advancement.

*   **Investment Return**
    Annual return on your stock/bond portfolio (e.g., [S&P 500 historical avg](https://www.investopedia.com/ask/answers/042415/what-average-annual-return-sp-500.asp) is ~10%, or ~7% adjusted for inflation).

*   **Inflation Rate**
    General loss of purchasing power over time.

*   **Inflation Adjusted (Toggle)**
    *   **On**: All dollar amounts (Net Worth, Cash Flow) are shown in "Today's Dollars".
    *   **Off**: Amounts are shown in future (nominal) dollars.

*   **Selling Cost**
    Transaction costs when you eventually sell the home (Agent commissions, transfer taxes, etc.). typically 6-10%.

---

## 🐖 Savings Strategy
*Behavioral assumptions: "Do you actually invest the money you save?"*

This is the **most critical** variable in the Rent vs. Buy debate.

*   **Renter Invests Surplus**
    If renting is cheaper than buying, what % of the monthly savings do you invest?
    *   **0%**: You spend the extra cash on lifestyle (Buying usually wins long-term).
    *   **100%**: You invest every penny of the savings (Renting often wins).

*   **Owner Invests Surplus**
    In later years, buying often becomes cheaper than renting (as rents rise). What % of *that* savings does the owner invest?
