import Link from 'next/link';

// Landing page. Static: no data reads, so it prerenders.
const STEPS = [
  { n: '1', title: 'Look up a ship by IMO', body: 'Twelve cruise ships that call at PortMiami, each identified by a check-digit-validated IMO number.' },
  { n: '2', title: 'See four labelled values', body: 'Scrap value, policy book value, reported deals and original cost. Each one says whether it is sourced, an estimate or a proxy.' },
  { n: '3', title: 'Add deals from the news', body: 'Paste a sentence from a filing or article. AI extracts the event, you review it, and nothing is saved without your OK.' },
  { n: '4', title: 'Get alerted, then decide', body: 'Saved alerts fire when a matching sale shows up. The Scenario Analyzer computes NPV, IRR and payback in code, never in the AI.' },
];

const PROBLEMS = [
  { title: 'Broker fees', body: 'Buying a vessel means paying brokers to tell you what is for sale and what it is worth.' },
  { title: 'Scattered listings', body: 'The market runs through broker networks. Nobody sees everything that is available.' },
  { title: 'Hidden prices', body: 'Public operators disclose fleet changes but often not sale prices. Valuations are not real time.' },
];

export default function Landing() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-sky-300">Cruise ships · PortMiami</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            What is a ship worth? See the evidence, not a broker&apos;s guess.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Second Hull is an AI valuation and advisory workspace for the second-hand cruise ship market. Every number is
            labelled as sourced, estimate or proxy, and missing prices stay missing.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/fleet" className="rounded-md bg-sky-500 px-5 py-2.5 font-semibold text-white hover:bg-sky-400">
              Browse the fleet
            </Link>
            <Link
              href="/vessel/9128532"
              className="rounded-md border border-slate-500 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
            >
              See an example: Norwegian Sky
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">The problem</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Honest by design</h2>
        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Rule tone="emerald" title="Sourced">Comes from a filing or a cited public source.</Rule>
          <Rule tone="amber" title="Estimate">Calculated by us, shown with a ~ and the method.</Rule>
          <Rule tone="orange" title="Proxy">A stand-in rate, e.g. dry-cargo scrap prices for cruise ships.</Rule>
          <Rule tone="slate" title="Price undisclosed">We never fill in a price that was not reported.</Rule>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          Comparable sale prices are the missing input in this market. That is the gap a data partner closes.
        </p>
      </section>
    </div>
  );
}

const tones = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  orange: 'border-orange-200 bg-orange-50 text-orange-900',
  slate: 'border-slate-200 bg-slate-100 text-slate-800',
};

function Rule({ tone, title, children }: { tone: keyof typeof tones; title: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-80">{children}</p>
    </div>
  );
}
