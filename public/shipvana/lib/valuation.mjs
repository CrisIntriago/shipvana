// Part F valuation. Four values only: scrap (Estimate, Proxy rate), policy book value (Estimate),
// reported deals (never calculated), original cost (Sourced). No other valuation.

// IMO check digit: multiply the first six digits by 7,6,5,4,3,2; the last digit of the sum must equal digit 7.
export function imoIsValid(imo) {
  if (!/^\d{7}$/.test(String(imo))) return false;
  const s = String(imo);
  const sum = [...s.slice(0, 6)].reduce((acc, d, i) => acc + Number(d) * (7 - i), 0);
  return sum % 10 === Number(s[6]);
}

export const ageIn2026 = (yearBuilt) => 2026 - yearBuilt;

// EST_ldt_tonnes x usd_per_ldt_dry / 1,000,000. The user may override LDT ("Your input").
export function scrapValueMusd({ ldtTonnes, usdPerLdtDry }) {
  return (ldtTonnes * usdPerLdtDry) / 1_000_000;
}

// original_cost x (1 - 0.85 x min(age, 30) / 30), Carnival policy applied to every ship.
// Returns null when original cost is blank ("Original cost not available").
export function policyBookValueMusd({ originalCostMusd, age, usefulLife = 30, residualPct = 15 }) {
  if (originalCostMusd == null || originalCostMusd === '') return null;
  const depreciable = 1 - residualPct / 100; // 0.85
  return originalCostMusd * (1 - (depreciable * Math.min(age, usefulLife)) / usefulLife);
}
