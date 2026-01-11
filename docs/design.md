# Design Doc: Shelter Math (Interactive Simulator)

## 1. Objective
To build a single-page interactive web application that provides a mathematically rigorous, side-by-side comparison of Renting vs. Buying over a configurable timeline (e.g., 30-50 years). Unlike standard calculators, this tool emphasizes the **"Crossover Point"**—the specific future date where the fixed costs of ownership defeat the compounding costs of renting.

## 2. Core Philosophy
*   **Logic over Emotion:** Pure math representation of cash flow and net worth.
*   **The Long Game:** Visualizing decades, not just the first 5 years.
*   **Total Transparency:** Every variable (inflation, market returns, maintenance) is exposed to the user.

## 3. User Experience (UX)

### Layout: "The Control Room"
A clean, dashboard-style interface. No scrolling walls of text.

*   **Left Panel (Inputs):** A collapsible or sticky sidebar with sliders and input fields.
*   **Center Stage (Visuals):** Two main interactive charts (toggleable).
*   **Right/Bottom Panel (The Verdict):** High-level metrics and the AI Summary button.

### Design Aesthetic
*   **Style:** "Matte & Modern." Flat design, high contrast, sans-serif typography (Inter or Roboto).
*   **Palette:** Dark mode default.
    *   **Renting:** Cool Blue/Cyan (symbolizing liquidity).
    *   **Buying:** Warm Orange/Amber (symbolizing solidity/asset).
    *   **Crossover Point:** Bright White highlight.

## 4. Functional Requirements

### A. Input Parameters (The Knobs)
*   **The Property:**
    *   Home Price ($)
    *   Down Payment (%)
    *   Mortgage Rate (%)
    *   Loan Term (Years)
    *   Property Tax Rate (%)
    *   Maintenance Costs (% of value, typically 1%)
    *   Home Appreciation Rate (%/year)
*   **The Rental:**
    *   Current Monthly Rent ($)
    *   Rent Inflation Rate (%) (Default to 5% based on CA reality)
    *   Renters Insurance ($/mo)
*   **The Market:**
    *   Investment Return Rate (%) (For the "Invest the Difference" calculation)
    *   General Inflation (%)

### B. The Mathematical Engine
The engine runs a month-by-month simulation for the selected duration (e.g., 360 months).

*   **Cash Flow Calculation:**
    *   *Owner Cost:* Mortgage (P&I) + Tax + Insurance + Maintenance. (Note: Tax/Ins/Maint inflate annually; P&I stays flat).
    *   *Renter Cost:* Rent + Insurance. (Inflates annually).
*   **"Invest the Difference" Logic (Bidirectional):**
    *   *Scenario A (Rent < Buy):* The Renter invests the monthly savings into the S&P 500.
    *   *Scenario B (Buy < Rent):* The Owner invests the monthly savings (once rent overtakes the mortgage) into the S&P 500.
*   **Net Worth Calculation:**
    *   *Owner Net Worth:* (Home Value - Remaining Principal) + (Investment Portfolio Value).
    *   *Renter Net Worth:* (Investment Portfolio Value from "saved" down payment + monthly contributions).

### C. Visualizations (The Charts)
Using **Recharts** for rendering.

*   **Chart 1: The Monthly Burn (Cash Flow)**
    *   Two lines.
    *   Line A (Buy): Starts high, stays relatively flat (only tax/maint creep up).
    *   Line B (Rent): Starts lower, curves upward exponentially.
    *   Visual Goal: Highlight the intersection (The "Break-even Month").
*   **Chart 2: The Wealth Gap (Net Worth)**
    *   Comparing Total Net Worth over time.
    *   Shows the "dip" where buying loses initially (transaction costs), and the eventual "hockey stick" where leverage kicks in.

### D. AI Integration ("The Analyst")
A button labeled "Analyze My Scenario."

*   **Action:** Bundles the final JSON state of the simulation (Inputs + Year 10/20/30 outcomes).
*   **Prompt:** Sends data to an LLM (Gemini/OpenAI) with a system prompt: "You are a brutally logical financial engineer. Analyze this user's housing scenario. Highlight the crossover date and the opportunity cost. Be concise."
*   **Output:** A streaming text block explaining the results in plain English.

## 5. Technical Stack
*   **Framework:** Next.js (App Router) + TypeScript
*   **Styling:** Tailwind CSS + Lucide React (Icons)
*   **Charts:** Recharts
*   **State Management:** Zustand
*   **AI:** Gemini REST API
*   **Deployment:** Vercel

## 6. Implementation Steps
1.  **Scaffold:** Set up Next.js + Tailwind + TypeScript.
2.  **Engine:** Write the `calculateMortgage` and `simulateTimeline` TypeScript functions.
3.  **UI:** Build the Input Sidebar and the layout grid.
4.  **Viz:** Wire up the Recharts line graphs to the simulation data.
5.  **AI:** Connect the "Analyze" button to a simple API route.