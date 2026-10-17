import Link from 'next/link';
import { DECISION_SUPPORT, Label, PublicBadge, fmtMusd, type LabelKind } from '@/components/labels';
import { policyBookValueMusd, scrapValueMusd } from '@/lib/core/valuation';

// Static sample (the page reads no data). Figures are the Norwegian Sky row in data/ships_cruise_miami.csv
// and the Bangladesh row in data/scrap_prices.csv, run through the same valuation code as the vessel page.
const SAMPLE = {
  name: 'Norwegian Sky',
  imo: '9128532',
  brand: 'Norwegian Cruise Line',
  ticker: 'NYSE: NCLH',
  yearBuilt: 1999,
  age: 27,
  grossTonnage: 77104,
  originalCostMusd: 357,
  estLdtTonnes: 26986,
  bangladeshUsdPerLdt: 500,
  deal: 'CHARTER to Cordelia Cruises',
};
const sampleScrap = scrapValueMusd({ ldtTonnes: SAMPLE.estLdtTonnes, usdPerLdtDry: SAMPLE.bangladeshUsdPerLdt });
const sampleBook = policyBookValueMusd({ originalCostMusd: SAMPLE.originalCostMusd, age: SAMPLE.age });

const VALUES = [
  {
    title: 'Scrap value',
    labels: ['Estimate', 'Proxy'] as LabelKind[],
    body: 'Estimated lightweight tonnage times the shipbreaking rate for the region you pick. The rate is a dry-cargo rate used as a proxy. You can type a real LDT instead.',
  },
  {
    title: 'Policy book value',
    labels: ['Estimate', 'Carnival policy applied'] as LabelKind[],
    body: 'Original cost depreciated over 30 years to a 15% residual, the policy Carnival discloses. 30 years is an accounting life, not a retirement age.',
  },
  {
    title: 'Reported deals',
    labels: ['Reported'] as LabelKind[],
    body: 'Sales, charters and exits from filings and news, with the source next to each one. If no price was published, it says "Price undisclosed".',
  },
  {
    title: 'Original cost',
    labels: ['Sourced'] as LabelKind[],
    body: 'The build cost from public records, when it is known. When it is not, the card says so and we leave the field blank.',
  },
];

const LEGEND: { kind: LabelKind; text: string }[] = [
  { kind: 'Sourced', text: 'Taken from a cited public source' },
  { kind: 'Estimate', text: 'Our calculation, shown with a "~"' },
  { kind: 'Proxy', text: 'A stand-in rate (scrap prices)' },
  { kind: 'Your input', text: 'A figure you typed' },
  { kind: 'Assumption', text: 'A default you can change (8% discount rate)' },
];

const LOOP = [
  { step: 'Search a ship by IMO', href: '/fleet', cta: 'Fleet' },
  { step: 'Read the four labelled values', href: '/vessel/9128532', cta: 'Norwegian Sky' },
  { step: 'Paste a sale sentence and review the extracted event', href: '/events', cta: 'Event Feed' },
  { step: 'Save it and watch your alert fire', href: '/alerts', cta: 'My alerts' },
  { step: 'Read the decision memo', href: '/advisor', cta: 'Advisor' },
  { step: 'Run a buy, lease or sell scenario', href: '/scenarios', cta: 'Scenario Analyzer' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Cruise ships calling at PortMiami</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              What is a used cruise ship worth? Look it up by IMO.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              SHIPVANA puts each ship&apos;s facts and evidence side by side. Every number says where it came from, and if a
              price was never published, we say so.
            </p>
            <form action="/fleet" className="mt-8 flex max-w-lg gap-2">
              <label htmlFor="hero-q" className="sr-only">
                IMO number or ship name
              </label>
              <input
                id="hero-q"
                name="q"
                inputMode="search"
                placeholder="IMO number or ship name, e.g. 9128532"
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button type="submit" className="rounded-md bg-blue-700 px-5 py-2.5 font-medium text-white hover:bg-blue-800">
                Search
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">{DECISION_SUPPORT}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Sample lookup</p>
            <SampleLookup />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {/* Four values */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Four values per ship. Nothing else.</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            We don&apos;t produce one market price. Each vessel page shows four separate figures, and each one is labelled.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <article key={v.title} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap gap-1">
                  {v.labels.map((l) => (
                    <Label key={l} kind={l} />
                  ))}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Honesty rules + demo loop */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">How to read the labels</h2>
            <ul className="mt-4 space-y-2.5">
              {LEGEND.map((l) => (
                <li key={l.kind} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="w-24 shrink-0">
                    <Label kind={l.kind} />
                  </span>
                  {l.text}
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <li>• A blank in the source stays blank. We never fill one in.</li>
              <li>• We never guess an IMO. Events without one go to a &quot;Needs IMO&quot; list.</li>
              <li>• Sale-and-leaseback deals are left out of price comparisons.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Try the full loop in three minutes</h2>
            <ol className="mt-4 space-y-2">
              {LOOP.map((l, i) => (
                <li key={l.step}>
                  <Link href={l.href} className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{l.step}</span>
                    <span className="text-xs text-slate-400 group-hover:text-blue-700">{l.cta} →</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

      </div>
    </div>
  );
}

function SampleLookup() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="font-mono text-xs text-slate-500">IMO {SAMPLE.imo}</p>
          <p className="font-semibold text-slate-900">{SAMPLE.name}</p>
          <p className="text-xs text-slate-500">
            {SAMPLE.brand} · built {SAMPLE.yearBuilt} · {SAMPLE.grossTonnage.toLocaleString('en-US')} GT
          </p>
        </div>
        <PublicBadge status="PUBLIC" ticker={SAMPLE.ticker} />
      </div>
      <ul className="divide-y divide-slate-100 text-sm">
        <SampleRow title="Scrap value" labels={<><Label kind="Estimate" /><Label kind="Proxy">Proxy rate</Label></>}>
          {fmtMusd(sampleScrap, { estimate: true })}
        </SampleRow>
        <SampleRow title="Policy book value" labels={<><Label kind="Estimate" /><Label kind="Carnival policy applied" /></>}>
          {sampleBook != null ? fmtMusd(sampleBook, { estimate: true }) : <span className="text-slate-400">Original cost not available</span>}
        </SampleRow>
        <SampleRow title="Reported deals" labels={<Label kind="Reported" />}>
          <span className="block text-right">
            {SAMPLE.deal}
            <span className="block text-xs font-medium text-slate-500">Price undisclosed</span>
          </span>
        </SampleRow>
        <SampleRow title="Original cost" labels={<Label kind="Sourced" />}>
          {fmtMusd(SAMPLE.originalCostMusd)}
        </SampleRow>
      </ul>
      <Link
        href={`/vessel/${SAMPLE.imo}`}
        className="block rounded-b-lg border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
      >
        Open the full vessel page →
      </Link>
    </div>
  );
}

function SampleRow({ title, labels, children }: { title: string; labels: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div>
        <p className="text-slate-700">{title}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">{labels}</div>
      </div>
      <div className="font-semibold tabular-nums text-slate-900">{children}</div>
    </li>
  );
}
