// Scenario Analyzer maths. Pure functions, no dependencies. USD millions, year-end cash flows t = 0..N.
// All calculations run in code, never in the AI.

export function npv(cashFlows, rate) {
  return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

export function fv(cashFlows, rate) {
  return npv(cashFlows, rate) * Math.pow(1 + rate, cashFlows.length - 1);
}

// IRR by bisection between -99% and 1000%. Returns null ("No IRR") if the cash flows never change sign
// or no root exists in the range. Never returns 0 or blank as a stand-in.
export function irr(cashFlows) {
  const hasPos = cashFlows.some((c) => c > 0);
  const hasNeg = cashFlows.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;
  let lo = -0.99;
  let hi = 10;
  let fLo = npv(cashFlows, lo);
  let fHi = npv(cashFlows, hi);
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(cashFlows, mid);
    if (Math.abs(fMid) < 1e-10) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

// First year where the running total is zero or more, else null ("Not within horizon").
export function payback(cashFlows) {
  let total = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    total += cashFlows[t];
    if (total >= 0) return t;
  }
  return null;
}

export function summarize(name, cashFlows, rate) {
  return {
    name,
    cashFlows,
    npv: npv(cashFlows, rate),
    irr: irr(cashFlows), // null means show "No IRR"
    fv: fv(cashFlows, rate),
    payback: payback(cashFlows), // null means show "Not within horizon"
  };
}

const flat = (years, amount) => Array.from({ length: years }, () => amount);

// Mode 1a: Buy or lease.
export function buyOrLease({ price, cfPerYear, years, residual = 0, leasePayment, rate }) {
  const buy = [-price, ...flat(years, cfPerYear)];
  buy[years] += residual;
  const lease = [0, ...flat(years, cfPerYear - leasePayment)]; // no residual to the lessee
  const options = [summarize('BUY', buy, rate), summarize('LEASE', lease, rate)];
  return rankAgainst(options, 'LEASE');
}

// Mode 1b: Trade in or expand.
export function tradeInOrExpand({ price, cfPerYear, years, residual = 0, oldCfPerYear, oldResidual = 0, oldNetSalePrice, rate }) {
  const buy = [-price, ...flat(years, cfPerYear)];
  buy[years] += residual;
  const keepOld = [0, ...flat(years, oldCfPerYear)];
  keepOld[years] += oldResidual;
  const expand = buy.map((v, i) => v + keepOld[i]);
  const tradeIn = buy.slice();
  tradeIn[0] += oldNetSalePrice; // sell old ship at t=0, drop its cash flows
  const options = [summarize('KEEP', keepOld, rate), summarize('EXPAND', expand, rate), summarize('TRADE-IN', tradeIn, rate)];
  return rankAgainst(options, 'KEEP');
}

// Mode 2: selling or retiring. Each option is optional; only supplied ones are tested.
export function sellOrRetire({ sellNow, scrap, charter, keep, rate }) {
  const options = [];
  if (sellNow) options.push(summarize('SELL NOW', [sellNow.netSalePrice], rate));
  if (scrap) options.push(summarize('SCRAP', [scrap.scrapValue - scrap.scrapCost], rate));
  if (charter) {
    const cf = [0, ...flat(charter.years, charter.incomePerYear)];
    cf[charter.years] += charter.salePriceAtEnd;
    options.push(summarize('CHARTER THEN SELL', cf, rate));
  }
  if (keep) {
    const cf = [0, ...flat(keep.years, keep.cfPerYear)];
    cf[keep.years] += keep.salePriceAtEnd;
    options.push(summarize('KEEP THEN SELL', cf, rate));
  }
  const ranked = [...options].sort((a, b) => b.npv - a.npv);
  const best = ranked[0];
  const second = ranked[1];
  const closeCall = second ? (best.npv - second.npv) / Math.abs(second.npv || 1) < 0.05 : false;
  return { ranked, best: best?.name, closeCall };
}

function rankAgainst(options, baselineName) {
  const base = options.find((o) => o.name === baselineName);
  const withDiff = options.map((o) => ({ ...o, npvVsBaseline: o.npv - base.npv }));
  return withDiff.sort((a, b) => b.npv - a.npv);
}

// Sensitivity: NPV at rate -2, 0 and +2 percentage points.
export function sensitivity(cashFlows, rate) {
  return [-0.02, 0, 0.02].map((d) => ({ rate: rate + d, npv: npv(cashFlows, rate + d) }));
}
