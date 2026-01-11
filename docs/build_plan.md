# Build Plan: Shelter Math

**Goal:** Create a "brutally logical" Rent vs. Buy simulator with a focus on the financial crossover point, featuring interactive charts and AI analysis.

**Tech Stack:**
*   **Framework:** Next.js 14+ (App Router) + TypeScript
*   **Styling:** Tailwind CSS + Lucide React
*   **State:** Zustand
*   **Charts:** Recharts
*   **AI:** Vercel AI SDK (with Google Gemini)

---

## Phase 1: Foundation & Logic (The Engine)

1.  **Scaffold Application:**
    *   Initialize Next.js project with TypeScript and Tailwind.
    *   Install key dependencies: `recharts`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`.
2.  **Math Core (`src/lib/engine.ts`):**
    *   Define TypeScript interfaces for `SimulationParams` and `SimulationResult`.
    *   Implement `calculateMonthlyPayments`: Mortgage P&I logic.
    *   Implement `simulateTimeline`: The core loop generating month-by-month cash flow and net worth data (30-50 year projection).
        *   *Logic check:* Ensure "Invest the Difference" handles both Rent<Buy and Buy<Rent scenarios.

## Phase 2: State & Inputs (The Control Room)

3.  **State Management (`src/store/useSimulationStore.ts`):**
    *   Create a Zustand store to hold user inputs (Home Price, Interest Rate, Rent, Inflation, etc.).
    *   Automatically re-run the `simulateTimeline` logic whenever inputs change.
4.  **UI Components - Inputs:**
    *   **Reference Design:** Consult `docs/ui/page_1.html` for the "Financial Cockpit" aesthetic and layout structure.
    *   Create reusable `NumberInput` and `Slider` components.
    *   Build the **Left Sidebar** containing the collapsible sections: "Property", "Rental", and "Market".

## Phase 3: Visualization (The Dashboard)

5.  **Layout Structure:**
    *   Implement a responsive dashboard layout: Sidebar (Left) + Charts (Center) + Metrics (Bottom/Right).
    *   Apply the "Matte & Modern" dark theme (Slate/Zinc palette with Cyan/Orange accents).
6.  **Chart Components:**
    *   **Cash Flow Chart:** Line graph comparing monthly "unrecoverable" costs vs. total cash outflow.
    *   **Net Worth Chart:** The critical "Wealth Gap" chart showing the crossover.
    *   Add custom tooltips and responsive containers.
7.  **Summary Metrics:**
    *   Display key stats: "Crossover Year", "Year 30 Net Worth Difference", "Total Interest Paid".

## Phase 4: Intelligence (The Analyst)

8.  **AI Integration:**
    *   Set up an API Route `app/api/analyze/route.ts` using the Vercel AI SDK.
    *   Create the "Analyze My Scenario" button.
    *   Construct the system prompt to interpret the JSON simulation data and provide a "brutally logical" text summary.

## Phase 5: Polish & Verify

9.  **Refinement:**
    *   Ensure mobile responsiveness (collapsible sidebar).
    *   Verify math edge cases (e.g., 0% down, high inflation).
10. **Final Build:**
    *   Run linting and type checking.
