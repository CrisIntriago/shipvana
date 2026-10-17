// Table row types. Field names are the CSV headers in public/shipvana/data, exactly.
// Blank CSV cells are stored as null, never as 0 or "".

export type Vessel = {
  name: string;
  imo: string;
  brand: string;
  parent_company: string;
  public_status: 'PUBLIC' | 'PRIVATE';
  ticker: string | null;
  year_built: number;
  age_2026: number;
  builder: string | null;
  build_country: string | null;
  gross_tonnage: number | null;
  length_m: number | null;
  beam_m: number | null;
  draft_m: number | null;
  passengers_double_occ: number | null;
  original_cost_musd: number | null;
  miami_connection: string | null;
  source: string | null;
  ownership_source: string | null;
  EST_ldt_tonnes: number | null;
  EST_ldt_basis: string | null;
  EST_scrap_value_musd_bangladesh: number | null;
  EST_policy_book_value_musd: number | null;
  EST_policy_basis: string | null;
  estimate_status: string | null;
};

export type EventState = 'Reported' | 'Confirmed' | 'Withdrawn';

export type VesselEvent = {
  id: string;
  ship_name: string;
  imo: string | null;
  imo_status: string | null;
  brand: string | null;
  seller_or_operator: string | null;
  counterparty: string | null;
  event_type: string; // SALE, SALE_AND_LEASEBACK, SALE_THEN_TRANSFER_TO_VIKING, CHARTER, EXIT, ORDER
  event_date: string | null;
  date_precision: string | null;
  year_built: number | null;
  price_musd: number | null;
  price_status: string | null;
  source: string | null;
  source_url: string | null;
  evidence_status: string | null; // free text, e.g. "Reported (sources conflict)"
  note: string | null;
  // App fields (not in the CSV)
  status: EventState;
  created_by: string | null;
  created_at: string;
};

export type ScrapPrice = {
  region: string;
  usd_per_ldt_dry: number | null;
  usd_per_ldt_tanker: number | null;
  usd_per_ldt_container: number | null;
  as_of: string | null;
  source: string | null;
  note: string | null;
};

export type AccountingPolicy = {
  company: string;
  ticker: string | null;
  useful_life_years: number | null;
  residual_pct_of_cost: number | null;
  basis: string | null;
  source: string | null;
  source_url: string | null;
  status: string | null;
  management_view_service_life_years: number | null;
  management_view_source: string | null;
};

export type Scenario = {
  ship_type: string;
  plan: string;
  EST_conversion_cost_musd: number | null;
  EST_net_income_per_year_musd: number | null;
  EST_years: number | null;
  EST_undiscounted_value_musd: number | null;
  what_it_involves: string | null;
  estimate_status: string | null;
};

export type Role = 'analyst' | 'contributor' | 'admin';

export type User = { id: string; name: string; role: Role };

export type Alert = {
  id: string;
  owner: string; // User.id
  name: string;
  is_active: boolean;
  imo: string | null;
  brand: string | null;
  parent_company: string | null;
  public_status: 'PUBLIC' | 'PRIVATE' | null;
  event_type: string | null;
  min_gross_tonnage: number | null;
  max_gross_tonnage: number | null;
  max_age: number | null;
  min_price_musd: number | null;
  max_price_musd: number | null;
  include_undisclosed_price: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  alert_id: string;
  event_id: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
};

export type ScenarioRun = {
  id: string;
  user_id: string;
  mode: 'buy' | 'sell';
  goal: string;
  imo: string | null;
  inputs_json: string;
  results_json: string;
  created_at: string;
};

export type InterestNote = {
  id: string;
  user_id: string;
  imo: string;
  note: string;
  created_at: string;
};
