# UI/UX Specification: Shelter Math

## 1. Design Philosophy: "The Financial Cockpit"

The interface should feel like a professional analytical tool, not a marketing landing page. It is a "Control Room" for
financial futures.

* **Keywords:** Precision, Dark Mode, High Contrast, Flat, Mathematical.
* **Inspiration:** Bloomberg Terminal meets Vercel Dashboard.

## 2. Color System (Tailwind Palette)

The app runs strictly in **Dark Mode**.

* **Backgrounds:**
    * `bg-zinc-950`: Main application background (Deepest void).
    * `bg-zinc-900`: Panels, Cards, Sidebar (Slightly elevated).
    * `bg-zinc-800`: Input fields, borders, hover states.
* **Semantic Colors (The Core Conflict):**
    * **Buying (Ownership):** `text-orange-500` / `stroke-orange-500` (Warmth, Asset).
    * **Renting (Liquidity):** `text-cyan-400` / `stroke-cyan-400` (Cool, Fluid).
    * **The Crossover (Profit):** `text-emerald-400` (Positive Net Worth Delta).
    * **The Loss:** `text-rose-500` (Negative Delta).
* **Text Hierarchy:**
    * Primary: `text-zinc-50` (White).
    * Secondary: `text-zinc-400` (Muted Labels).
    * Tertiary: `text-zinc-600` (Placeholder/Disabled).

## 3. Layout & Structure

### A. The Shell (Desktop)

A fixed-height, non-scrolling dashboard (where screen size permits).

* **Left Sidebar (320px - 400px):** "Input Control." Scrollable independently.
* **Main Area (Flex Grow):** "The Simulation." Holds charts and high-level metrics.

### B. The Shell (Mobile)

* Stack layout.
* **Top:** Key KPI (e.g., "Crossover Year").
* **Middle:** Charts (Swipeable or stacked).
* **Bottom:** Inputs in a collapsible bottom sheet or accordion.

## 4. Component Details

### A. The Input Group ("The Knobs")

Each variable (e.g., Home Price) consists of a joined input + slider mechanism for rapid "what-if" scenarios.

* **Label:** Small, Uppercase, Tracking-wide (`text-xs font-bold text-zinc-500`).
* **Value Display:** Large, monospaced number on the right (`text-white`).
* **Slider:**
    * Track: `bg-zinc-800 h-1`.
    * Fill: `bg-white` (or `bg-orange-500`/`bg-cyan-400` if category-specific).
    * Thumb: Simple circle, no shadow, scales on hover.
* **Input Field:**
    * Invisible borders until focused.
    * `tabular-nums` class for non-jittery number updates.

### B. The Charts ("The Viewport")

Using Recharts. Minimalist configuration.

* **Grid:** Very subtle horizontal lines only (`stroke-zinc-800`).
* **Axes:** No axis lines, just tick labels (`text-xs text-zinc-500`).
* **Tooltip:**
    * Backdrop blur `backdrop-blur-md bg-zinc-900/90`.
    * Thin border `border border-zinc-700`.
    * Comparison logic: "Buying is $X cheaper this month."

### C. The Metric Cards ("The Verdict")

Located below charts or to the right.

* **Main Card:** "Crossover Point"
    * Big Stat: "Year 7, Month 4"
    * Context: "When buying beats renting."
* **Secondary Cards:** Net Worth @ Year 30.
* **AI Button:**
    * `bg-indigo-600 hover:bg-indigo-500 text-white`.
    * Icon: Sparkles/Stars.
    * Animation: Gentle pulse when analysis is ready.

## 5. Typography

* **Font:** `Inter` or `Geist Sans`.
* **Numbers:** `font-mono` or `tabular-nums` enabled everywhere numbers change dynamically. This prevents the UI from "shaking" as digits change width during interaction.

## 6. Interaction States

* **Hover:** Charts should highlight the specific year/month across ALL charts simultaneously (synchronized tooltips).
* **Drag:** Sliders must update the chart *synchronously* (60fps) without lag.
