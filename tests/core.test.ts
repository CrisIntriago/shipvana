// 1:1 port of public/shipvana/tests/all.test.mjs against the TypeScript libs. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { npv, fv, irr, payback, buyOrLease, tradeInOrExpand, sellOrRetire } from '../lib/core/finance.ts';
import { imoIsValid, ageIn2026, scrapValueMusd, policyBookValueMusd } from '../lib/core/valuation.ts';
import { alertMatches } from '../lib/core/alerts.ts';
import { parseCsv } from '../lib/core/csv.ts';

const readCsv = (file: string) => parseCsv(readFileSync(new URL(`../public/shipvana/data/${file}`, import.meta.url), 'utf8'));
const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('Part L reference case: buy or lease (r=8%, N=10)', () => {
  const r = 0.08;
  const buy = [-300, ...Array(9).fill(45), 45 + 120];
  close(npv(buy, r), 57.54);
  close(irr(buy)! * 100, 11.5);
  close(fv(buy, r), 124.22);
  assert.equal(payback(buy), 7);
  const lease = [0, ...Array(10).fill(45 - 38)];
  close(npv(lease, r), 46.97);
  assert.equal(irr(lease), null);
  close(fv(lease, r), 101.41);
  const res = buyOrLease({ price: 300, cfPerYear: 45, years: 10, residual: 120, leasePayment: 38, rate: r });
  assert.equal(res[0].name, 'BUY');
  close(res[0].npvVsBaseline, 57.54 - 46.97);
});

test('Part L reference case: trade in or expand', () => {
  const res = tradeInOrExpand({ price: 300, cfPerYear: 45, years: 10, residual: 120, oldCfPerYear: 15, oldResidual: 10, oldNetSalePrice: 60, rate: 0.08 });
  const by = Object.fromEntries(res.map((o) => [o.name, o]));
  close(by.KEEP.npv, 105.28);
  close(by.EXPAND.npv, 162.82);
  close(by.EXPAND.npvVsBaseline, 57.54);
  close(by['TRADE-IN'].npv, 117.54);
  close(by['TRADE-IN'].npvVsBaseline, 12.25);
});

test('Part L reference case: selling or retiring', () => {
  const res = sellOrRetire({
    sellNow: { netSalePrice: 95 },
    scrap: { scrapValue: 13.49, scrapCost: 1.5 },
    charter: { incomePerYear: 12, years: 3, salePriceAtEnd: 70 },
    keep: { cfPerYear: 9, years: 5, salePriceAtEnd: 40 },
    rate: 0.08,
  });
  const by = Object.fromEntries(res.ranked.map((o) => [o.name, o.npv]));
  close(by['SELL NOW'], 95.0);
  close(by.SCRAP, 11.99);
  close(by['CHARTER THEN SELL'], 86.49);
  close(by['KEEP THEN SELL'], 63.16);
  assert.equal(res.best, 'SELL NOW');
  assert.equal(res.closeCall, false);
});

test('all 12 seed ships: IMO valid, scrap and policy values match the stored estimates', () => {
  const ships = readCsv('ships_cruise_miami.csv');
  assert.equal(ships.length, 12);
  for (const s of ships) {
    assert.ok(imoIsValid(s.imo), `bad IMO ${s.imo} (${s.name})`);
    assert.equal(ageIn2026(Number(s.year_built)), Number(s.age_2026));
    close(scrapValueMusd({ ldtTonnes: Number(s.EST_ldt_tonnes), usdPerLdtDry: 500 }), Number(s.EST_scrap_value_musd_bangladesh), 0.011);
    const pbv = policyBookValueMusd({ originalCostMusd: s.original_cost_musd === '' ? null : Number(s.original_cost_musd), age: Number(s.age_2026) });
    if (s.EST_policy_book_value_musd === '') assert.equal(s.original_cost_musd === '' ? pbv : null, null);
    else close(pbv!, Number(s.EST_policy_book_value_musd), 0.011);
  }
});

test('IMO check digit rejects a bad number', () => {
  assert.equal(imoIsValid('9837456'), true);
  assert.equal(imoIsValid('9837457'), false);
  assert.equal(imoIsValid('IMO 9837456'), false);
});

test('demo alert fires on exactly Seabourn Sojourn and Costa Fortuna', () => {
  const events = readCsv('vessel_events_cruise.csv');
  assert.equal(events.length, 5);
  assert.equal(events.filter((e) => e.imo === '').length, 4);
  const demo = { parent_company: 'Carnival Corporation', event_type: 'SALE', include_undisclosed_price: true };
  const hits = events.filter((e) => alertMatches(demo, e, null)).map((e) => e.ship_name);
  assert.deepEqual(hits.sort(), ['Costa Fortuna', 'Seabourn Sojourn']);
});

test('price criteria and missing ship data', () => {
  const ev = { event_type: 'SALE', price_musd: '', seller_or_operator: 'Carnival Corporation' };
  assert.equal(alertMatches({ min_price_musd: 10, include_undisclosed_price: false }, ev), false);
  assert.equal(alertMatches({ min_price_musd: 10, include_undisclosed_price: true }, ev), true);
  assert.equal(alertMatches({ min_gross_tonnage: 50000 }, ev, null), false);
  assert.equal(alertMatches({ event_type: 'SALE' }, { ...ev, status: 'Withdrawn' }), false);
});
