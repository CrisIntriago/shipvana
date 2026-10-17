// Honesty labels. Every number on screen carries one of these.
export type LabelKind = 'Sourced' | 'Estimate' | 'Proxy' | 'Your input' | 'Assumption' | 'Carnival policy applied' | 'Reported';

const styles: Record<LabelKind, string> = {
  Sourced: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Estimate: 'bg-amber-50 text-amber-800 ring-amber-200',
  Proxy: 'bg-orange-50 text-orange-800 ring-orange-200',
  'Your input': 'bg-sky-50 text-sky-800 ring-sky-200',
  Assumption: 'bg-violet-50 text-violet-800 ring-violet-200',
  'Carnival policy applied': 'bg-stone-100 text-stone-700 ring-stone-300',
  Reported: 'bg-slate-100 text-slate-700 ring-slate-300',
};

export function Label({ kind, children }: { kind: LabelKind; children?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${styles[kind]}`}>
      {children ?? kind}
    </span>
  );
}

export function fmtNum(n: number, digits = 2) {
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/** USD millions. Estimates get a "~" prefix. */
export function fmtMusd(n: number, opts: { estimate?: boolean; digits?: number } = {}) {
  return `${opts.estimate ? '~' : ''}$${fmtNum(n, opts.digits ?? 2)}M`;
}

/** Renders a value or an explicit "not available" text. Never shows 0 for a blank. */
export function OrBlank({ value, blank = 'Not available' }: { value: React.ReactNode | null | undefined; blank?: string }) {
  if (value === null || value === undefined || value === '') return <span className="text-slate-400">{blank}</span>;
  return <>{value}</>;
}

export function PublicBadge({ status, ticker }: { status: 'PUBLIC' | 'PRIVATE'; ticker: string | null }) {
  if (status === 'PUBLIC')
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white" title="Files with the SEC">
        PUBLIC{ticker ? ` · ${ticker}` : ''}
      </span>
    );
  return (
    <span className="inline-flex items-center rounded bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white" title="No public financial filings expected">
      PRIVATE
    </span>
  );
}

export const DECISION_SUPPORT = 'Decision support, not financial advice. Results depend only on the figures you enter.';

// Event types that must never enter a price comparison.
export const EXCLUDED_FROM_PRICE_COMPARISON = ['SALE_AND_LEASEBACK', 'SALE_THEN_TRANSFER_TO_VIKING'];

export function PriceCell({ price, status }: { price: number | null; status: string | null }) {
  if (price === null || (status ?? '').toUpperCase().startsWith('UNDISCLOSED'))
    return <span className="font-medium text-slate-500">Price undisclosed</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-semibold tabular-nums">{fmtMusd(price)}</span>
      <Label kind="Reported">REPORTED</Label>
    </span>
  );
}
