# AI Narrative Engine Strategy

## 1. The Data Payload (What we send to the AI)

We don't send the entire 360-month spreadsheet. We send a "Lifestyle Snapshot" JSON that captures the friction points.

```json
{
  "scenario_profile": {
    "location_type": "High Cost / California",
    "savings_discipline": 0.0, // "Human Mode" (0%) or "Robot Mode" (100%)
    "prop_13_active": true
  },
  "timeline_snapshots": {
    "year_1": {
      "renter_monthly_spend": 3200,
      "owner_monthly_spend": 5800,
      "cash_flow_gap": -2600, // Owner is bleeding $2600/mo
      "insight": "The 'Ramen Noodle' Phase"
    },
    "year_10": {
      "renter_monthly_spend": 5200, // Rent inflation kicked in
      "owner_monthly_spend": 6100, // Only tax/ins went up
      "net_worth_gap": "Renter is ahead by $50k (due to initial liquidity)"
    },
    "crossover_point": {
      "year": 14,
      "message": "The year your mortgage becomes cheaper than rent."
    },
    "year_30": {
      "renter_monthly_spend": 11500, // Rent is now insane
      "owner_monthly_spend": 0, // Mortgage paid off! (Just tax/ins ~1500)
      "owner_equity": 3500000, // Massive asset
      "renter_liquid_cash": 400000 // Did they invest well?
    }
  }
}
```

## 2. The System Prompt (The Persona)

**Role:** You are a brutally honest "Ghost of Christmas Future" for financial decisions. You do not speak in bank jargon; you speak in lifestyle realities. You are empathetic but unyielding about the consequences of inflation and discipline.

**Objective:** Based on the user's simulation data, paint a vivid picture of their life in three acts: The Struggle (Years 1-5), The Shift (The Crossover Era), and The Legacy (Year 30+).

**Crucial Rules:**
*   **Respect the "Discipline" Setting:** If `savings_discipline` is low (0-20%), assume the Renter spent the difference on travel, cars, and dining. Do NOT pretend they have a massive stock portfolio. Tell them they are broke but had fun.
*   **The "California Reality":** If `prop_13` is active, emphasize how their neighbors are paying triple their property tax, effectively trapping them in a "golden cage" of low costs.
*   **The Freedom Factor:** Contrast the Renter's mobility (moving for a job) vs. the Owner's stability (building a workshop, painting walls).

**Tone:** Conversational, slightly witty, rooted in hard math.

## 3. Example Outputs (The "Vibe")

### Scenario A: The "Human Mode" Renter (0% Discipline)

User rents a nice place but spends the savings.

**"The Verdict: The Lifestyle Trap"**

*   **Year 1-5 (The Party Phase):** You feel like a genius. While your homeowner friends are spending their Saturdays at Home Depot and eating leftovers to pay that $5,800 mortgage, you have an extra $2,600/month. You lease a nice car, go to Europe, and live stress-free. The math looks great.
*   **Year 15 (The Squeeze):** The tide turns. Your landlord just raised rent to $6,500. Your income went up, but so did groceries and gas. Meanwhile, your homeowner friend's payment is still flat. You’re starting to feel the pinch, and you have zero equity to show for the last decade of checks.
*   **Year 30 (The Crisis):** You are 60 years old. Rent is now $11,000/month. You have no house to sell, and because you spent that extra cash in your 30s, you have a small 401k. You are forced to move to a cheaper area.
