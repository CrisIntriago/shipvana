import 'server-only';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseCsv, num, str } from '@/lib/core/csv';
import { alertMatches, notificationFor } from '@/lib/core/alerts';
import { imoIsValid } from '@/lib/core/valuation';
import type {
  AccountingPolicy,
  Alert,
  InterestNote,
  Notification,
  Scenario,
  ScenarioRun,
  ScrapPrice,
  User,
  Vessel,
  VesselEvent,
} from '@/lib/core/types';

// Single source of truth for all tables. Reference tables are seeded from the CSVs on every boot.
// Mutable tables (events, alerts, notifications, scenario runs, interest notes) persist to .data/store.json.
// To move to Postgres later, keep these function signatures and swap the internals.

const DATA_DIR = path.join(process.cwd(), 'public', 'shipvana', 'data');
const STORE_FILE = path.join(process.cwd(), '.data', 'store.json');

export const USERS: User[] = [
  { id: 'u_analyst', name: 'Ana (Analyst / Buyer)', role: 'analyst' },
  { id: 'u_contributor', name: 'Cole (Contributor)', role: 'contributor' },
  { id: 'u_admin', name: 'Ada (Admin)', role: 'admin' },
];

type Mutable = {
  events: VesselEvent[];
  alerts: Alert[];
  notifications: Notification[];
  scenarioRuns: ScenarioRun[];
  interestNotes: InterestNote[];
};

type Store = Mutable & {
  vessels: Vessel[];
  scrapPrices: ScrapPrice[];
  policies: AccountingPolicy[];
  scenarios: Scenario[];
};

const readCsv = (file: string) => parseCsv(readFileSync(path.join(DATA_DIR, file), 'utf8'));
const nowIso = () => new Date().toISOString();
export const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

function loadVessels(): Vessel[] {
  return readCsv('ships_cruise_miami.csv').map((r) => {
    if (!imoIsValid(r.imo)) throw new Error(`Seed vessel ${r.name} has invalid IMO ${r.imo}`);
    return {
      name: r.name,
      imo: r.imo,
      brand: r.brand,
      parent_company: r.parent_company,
      public_status: r.public_status === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
      ticker: str(r.ticker),
      year_built: Number(r.year_built),
      age_2026: Number(r.age_2026),
      builder: str(r.builder),
      build_country: str(r.build_country),
      gross_tonnage: num(r.gross_tonnage),
      length_m: num(r.length_m),
      beam_m: num(r.beam_m),
      draft_m: num(r.draft_m),
      passengers_double_occ: num(r.passengers_double_occ),
      original_cost_musd: num(r.original_cost_musd),
      miami_connection: str(r.miami_connection),
      source: str(r.source),
      ownership_source: str(r.ownership_source),
      EST_ldt_tonnes: num(r.EST_ldt_tonnes),
      EST_ldt_basis: str(r.EST_ldt_basis),
      EST_scrap_value_musd_bangladesh: num(r.EST_scrap_value_musd_bangladesh),
      EST_policy_book_value_musd: num(r.EST_policy_book_value_musd),
      EST_policy_basis: str(r.EST_policy_basis),
      estimate_status: str(r.estimate_status),
    };
  });
}

function loadSeedEvents(): VesselEvent[] {
  return readCsv('vessel_events_cruise.csv').map((r, i) => ({
    id: `seed_${i + 1}`,
    ship_name: r.ship_name,
    imo: str(r.imo),
    imo_status: str(r.imo_status),
    brand: str(r.brand),
    seller_or_operator: str(r.seller_or_operator),
    counterparty: str(r.counterparty),
    event_type: r.event_type,
    event_date: str(r.event_date),
    date_precision: str(r.date_precision),
    year_built: num(r.year_built),
    price_musd: num(r.price_musd),
    price_status: str(r.price_status),
    source: str(r.source),
    source_url: str(r.source_url),
    evidence_status: str(r.evidence_status),
    note: str(r.note),
    status: 'Reported', // all five seeds are Reported; none is confirmed as completed
    created_by: null,
    created_at: '2026-10-17T00:00:00.000Z',
  }));
}

const loadScrapPrices = (): ScrapPrice[] =>
  readCsv('scrap_prices.csv').map((r) => ({
    region: r.region,
    usd_per_ldt_dry: num(r.usd_per_ldt_dry),
    usd_per_ldt_tanker: num(r.usd_per_ldt_tanker),
    usd_per_ldt_container: num(r.usd_per_ldt_container),
    as_of: str(r.as_of),
    source: str(r.source),
    note: str(r.note),
  }));

const loadPolicies = (): AccountingPolicy[] =>
  readCsv('accounting_policies.csv').map((r) => ({
    company: r.company,
    ticker: str(r.ticker),
    useful_life_years: num(r.useful_life_years),
    residual_pct_of_cost: num(r.residual_pct_of_cost),
    basis: str(r.basis),
    source: str(r.source),
    source_url: str(r.source_url),
    status: str(r.status),
    management_view_service_life_years: num(r.management_view_service_life_years),
    management_view_source: str(r.management_view_source),
  }));

const loadScenarios = (): Scenario[] =>
  readCsv('repurposing_scenarios_ESTIMATES.csv').map((r) => ({
    ship_type: r.ship_type,
    plan: r.plan,
    EST_conversion_cost_musd: num(r.EST_conversion_cost_musd),
    EST_net_income_per_year_musd: num(r.EST_net_income_per_year_musd),
    EST_years: num(r.EST_years),
    EST_undiscounted_value_musd: num(r.EST_undiscounted_value_musd),
    what_it_involves: str(r.what_it_involves),
    estimate_status: str(r.estimate_status),
  }));

function freshMutable(vessels: Vessel[]): Mutable {
  const m: Mutable = {
    events: loadSeedEvents(),
    alerts: [
      {
        id: 'alert_demo',
        owner: 'u_analyst',
        name: 'Any Carnival Corporation sale with an undisclosed price',
        is_active: true,
        imo: null,
        brand: null,
        parent_company: 'Carnival Corporation',
        public_status: null,
        event_type: 'SALE',
        min_gross_tonnage: null,
        max_gross_tonnage: null,
        max_age: null,
        min_price_musd: null,
        max_price_musd: null,
        include_undisclosed_price: true,
        created_at: '2026-10-17T00:00:00.000Z',
      },
    ],
    notifications: [],
    scenarioRuns: [],
    interestNotes: [],
  };
  // The seed data fires the demo alert (Seabourn Sojourn and Costa Fortuna).
  for (const e of m.events) matchInto(m, vessels, e);
  return m;
}

function load(): Store {
  const vessels = loadVessels();
  let mutable: Mutable;
  if (existsSync(STORE_FILE)) {
    mutable = JSON.parse(readFileSync(STORE_FILE, 'utf8')) as Mutable;
  } else {
    mutable = freshMutable(vessels);
  }
  return { ...mutable, vessels, scrapPrices: loadScrapPrices(), policies: loadPolicies(), scenarios: loadScenarios() };
}

// Survive dev hot reloads.
const g = globalThis as unknown as { __secondHullStore?: Store };
export function store(): Store {
  if (!g.__secondHullStore) g.__secondHullStore = load();
  return g.__secondHullStore;
}

export function persist() {
  const s = store();
  const mutable: Mutable = {
    events: s.events,
    alerts: s.alerts,
    notifications: s.notifications,
    scenarioRuns: s.scenarioRuns,
    interestNotes: s.interestNotes,
  };
  try {
    mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    writeFileSync(STORE_FILE, JSON.stringify(mutable, null, 2));
  } catch {
    // Read-only filesystem (e.g. serverless): keep the in-memory state only.
  }
}

export function resetStore() {
  const vessels = loadVessels();
  g.__secondHullStore = {
    ...freshMutable(vessels),
    vessels,
    scrapPrices: loadScrapPrices(),
    policies: loadPolicies(),
    scenarios: loadScenarios(),
  };
  persist();
}

export const vesselForEvent = (vessels: Vessel[], e: VesselEvent) =>
  e.imo ? (vessels.find((v) => v.imo === e.imo) ?? null) : null;

// Part D: one notification per (alert, event) pair. Returns the notifications created.
function matchInto(m: Mutable, vessels: Vessel[], event: VesselEvent): Notification[] {
  const vessel = vesselForEvent(vessels, event);
  const created: Notification[] = [];
  for (const alert of m.alerts) {
    if (!alert.is_active) continue;
    if (m.notifications.some((n) => n.alert_id === alert.id && n.event_id === event.id)) continue;
    if (!alertMatches(alert, event, vessel)) continue;
    const n = notificationFor(event, vessel);
    const notification: Notification = {
      id: newId('ntf'),
      user_id: alert.owner,
      alert_id: alert.id,
      event_id: event.id,
      ...n,
      read: false,
      created_at: nowIso(),
    };
    m.notifications.push(notification);
    created.push(notification);
  }
  return created;
}

/** Run alert matching for one event (on save, and again when its IMO is matched later). */
export function runAlertMatching(event: VesselEvent): Notification[] {
  const s = store();
  const created = matchInto(s, s.vessels, event);
  if (created.length) persist();
  return created;
}

/** "Check now" fallback: run matching over every event. */
export function runAlertMatchingAll(): Notification[] {
  const s = store();
  const created = s.events.flatMap((e) => matchInto(s, s.vessels, e));
  if (created.length) persist();
  return created;
}
