# sheltermath

A mathematically rigorous, single-page interactive web application that provides a side-by-side financial comparison of Renting vs. Buying over a configurable timeline.

Designed as a "Financial Cockpit", sheltermath helps users visualize the long-term impact of their housing decisions, factoring in opportunity costs, investment returns, and disciplined saving strategies.

## Key Features

- **Interactive Simulation Engine**: Compare Net Worth, Cash Flow, and total financial outcomes over 30-50+ years.
- **Configurable Parameters**:
  - Adjust "Owner" vs. "Renter" savings discipline (0-100%).
  - Set market assumptions (Investment Return Rate, Home Appreciation, Inflation).
  - Customize loan details (Down Payment, Interest Rate, Term).
- **Rich Visualizations**:
  - **Net Worth Chart**: Track wealth accumulation over time.
  - **Cash Flow Chart**: Analyze monthly and annual expenses vs. investments.
  - **Annual Breakdown**: Double-entry style bar charts showing expenses, growth, and transfers.
- **Responsive Design**: Sidebar controls that work on desktop and mobile, with a dark mode aesthetic for precision and clarity.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sheltermath.git
   cd sheltermath
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Run the test suite to ensure the simulation engine and components are working correctly:

```bash
npm test
```

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: React components (Charts, UI elements, Sidebar).
- `src/lib`: Core logic (`engine.ts` for calculations, `config.ts`).
- `src/store`: Global state management (`useSimulationStore.ts`).

## License

This project is open source and available under the [MIT License](LICENSE).
