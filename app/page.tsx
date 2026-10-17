import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Anchor, BadgeCheck, Coins, Landmark, Recycle, Search } from 'lucide-react';
import { DECISION_SUPPORT, Label, PublicBadge, fmtMusd, type LabelKind } from '@/components/labels';
import { Eyebrow, Panel, PhotoCredit, SectionTitle, ShipImage, buttonClass } from '@/components/ui';
import { HERO_PHOTO, PORT_PHOTO, photoForImo } from '@/lib/ship-photos';
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

// Ships from data/ships_cruise_miami.csv that have an open-licence photo.
const FEATURED = [
  { imo: '9837456', name: 'Carnival Celebration', brand: 'Carnival Cruise Line' },
  { imo: '9744001', name: 'Symphony of the Seas', brand: 'Royal Caribbean International' },
  { imo: '9804801', name: 'Scarlet Lady', brand: 'Virgin Voyages' },
  { imo: '9803613', name: 'MSC Grandiosa', brand: 'MSC Cruises' },
];

const VALUES = [
  {
    title: 'Scrap value',
    icon: Recycle,
    labels: ['Estimate', 'Proxy'] as LabelKind[],
    body: 'Estimated lightweight tonnage times the shipbreaking rate for the region you pick. The rate is a dry-cargo rate used as a proxy. You can type a real LDT instead.',
  },
  {
    title: 'Policy book value',
    icon: Landmark,
    labels: ['Estimate', 'Carnival policy applied'] as LabelKind[],
    body: 'Original cost depreciated over 30 years to a 15% residual, the policy Carnival discloses. 30 years is an accounting life, not a retirement age.',
  },
  {
    title: 'Reported deals',
    icon: Coins,
    labels: ['Reported'] as LabelKind[],
    body: 'Sales, charters and exits from filings and news, with the source next to each one. If no price was published, it says "Price undisclosed".',
  },
  {
    title: 'Original cost',
    icon: BadgeCheck,
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
  { step: 'Run a buy, lease or sell scenario', href: '/scenarios', cta: 'Scenarios' },
];

export default function Home() {
  return (
    <div>
      {/* Hero: full-bleed PortMiami photo */}
      <section className="relative isolate overflow-hidden bg-abyss text-white">
        <Image
          src={HERO_PHOTO.file}
          alt="Carnival Celebration departing PortMiami, seen from the beach"
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-[50%_35%]"
        />
        <div className="absolute inset-0 -z-10 bg-black/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-abyss/95 via-abyss/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-abyss/80 to-transparent" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <Eyebrow>
              <Anchor className="h-3.5 w-3.5" aria-hidden /> Cruise ships calling at PortMiami
            </Eyebrow>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              What is a used cruise ship <em className="text-brass-light">worth?</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85 [text-shadow:0_1px_3px_rgb(0_0_0/0.5)]">
              Look it up by IMO. SHIPVANA puts each ship&apos;s facts and evidence side by side. Every number says where it
              came from, and if a price was never published, we say so.
            </p>
            <form action="/fleet" className="mt-8 flex max-w-xl gap-2 rounded-xl border border-white/15 bg-white/10 p-1.5 backdrop-blur-md">
              <label htmlFor="hero-q" className="sr-only">
                IMO number or ship name
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" aria-hidden />
                <input
                  id="hero-q"
                  name="q"
                  inputMode="search"
                  placeholder="IMO number or ship name, e.g. 9128532"
                  className="w-full rounded-lg bg-transparent py-2.5 pl-10 pr-3 text-base text-white placeholder:text-white/45 focus:outline-none"
                />
              </div>
              <button type="submit" className={buttonClass('brass', 'px-5')}>
                Search
              </button>
            </form>
            <p className="mt-3 text-xs text-white/70 [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">{DECISION_SUPPORT}</p>
          </div>
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md bg-abyss/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden /> Sample lookup
            </p>
            <SampleLookup />
          </div>
        </div>
        <PhotoCredit photo={HERO_PHOTO} className="absolute bottom-3 right-3" />
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16">
        {/* Four values */}
        <section>
          <SectionTitle
            eyebrow="The valuation"
            title="Four values per ship. Nothing else."
            description="We don't produce one market price. Each vessel page shows four separate figures, and each one is labelled."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ title, icon: Icon, labels, body }) => (
              <Panel as="article" key={title} className="group p-5 transition hover:-translate-y-0.5 hover:border-harbor/30 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-harbor-tint text-harbor">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {labels.map((l) => (
                      <Label key={l} kind={l} />
                    ))}
                  </div>
                </div>
                <h3 className="mt-4 font-display text-2xl text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              </Panel>
            ))}
          </div>
        </section>

        {/* Featured ships */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="The fleet" title="Ships that call at Miami" />
            <Link href="/fleet" className={buttonClass('secondary')}>
              Browse the fleet <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED.map((s) => (
              <Link key={s.imo} href={`/vessel/${s.imo}`} className="group overflow-hidden rounded-xl border border-line bg-white">
                <ShipImage
                  photo={photoForImo(s.imo)}
                  alt={s.name}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] transition duration-500 [&_img]:group-hover:scale-105 [&_img]:transition [&_img]:duration-500"
                />
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="font-display text-xl leading-tight text-ink">{s.name}</p>
                    <p className="text-xs text-muted">
                      {s.brand} · <span className="font-mono">IMO {s.imo}</span>
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-harbor" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Panorama band */}
      <section className="relative isolate overflow-hidden bg-abyss text-white">
        <Image src={PORT_PHOTO.file} alt="Cruise ships berthed along PortMiami" fill sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-abyss/95 via-abyss/70 to-abyss/30" />
        <div className="mx-auto max-w-7xl px-4 py-20">
          <Eyebrow>Our honesty rules</Eyebrow>
          <p className="mt-4 max-w-3xl font-display text-3xl leading-snug sm:text-4xl">
            A blank in the source stays blank. We never guess an IMO. And the AI only explains numbers; it never makes them.
          </p>
        </div>
        <PhotoCredit photo={PORT_PHOTO} className="absolute bottom-3 right-3" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Labels + demo loop */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6 sm:p-8">
            <h2 className="font-display text-3xl text-ink">How to read the labels</h2>
            <ul className="mt-5 space-y-3">
              {LEGEND.map((l) => (
                <li key={l.kind} className="flex items-center gap-3 text-sm text-ink/80">
                  <span className="w-24 shrink-0">
                    <Label kind={l.kind} />
                  </span>
                  {l.text}
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-muted">
              <li>• A blank in the source stays blank. We never fill one in.</li>
              <li>• We never guess an IMO. Events without one go to a &quot;Needs IMO&quot; list.</li>
              <li>• Sale-and-leaseback deals are left out of price comparisons.</li>
            </ul>
          </Panel>

          <Panel className="p-6 sm:p-8">
            <h2 className="font-display text-3xl text-ink">Try the full loop in three minutes</h2>
            <ol className="mt-5 space-y-1">
              {LOOP.map((l, i) => (
                <li key={l.step}>
                  <Link href={l.href} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-harbor-tint">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brass/40 font-display text-sm text-brass">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-ink/80">{l.step}</span>
                    <span className="flex items-center gap-1 text-xs text-muted group-hover:text-harbor">
                      {l.cta} <ArrowRight className="h-3 w-3" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function SampleLookup() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-white text-ink shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-xs text-muted">IMO {SAMPLE.imo}</p>
          <p className="font-display text-2xl leading-tight">{SAMPLE.name}</p>
          <p className="text-xs text-muted">
            {SAMPLE.brand} · built {SAMPLE.yearBuilt} · {SAMPLE.grossTonnage.toLocaleString('en-US')} GT
          </p>
        </div>
        <PublicBadge status="PUBLIC" ticker={SAMPLE.ticker} />
      </div>
      <ul className="divide-y divide-line text-sm">
        <SampleRow title="Scrap value" labels={<><Label kind="Estimate" /><Label kind="Proxy">Proxy rate</Label></>}>
          {fmtMusd(sampleScrap, { estimate: true })}
        </SampleRow>
        <SampleRow title="Policy book value" labels={<><Label kind="Estimate" /><Label kind="Carnival policy applied" /></>}>
          {sampleBook != null ? fmtMusd(sampleBook, { estimate: true }) : <span className="text-muted">Original cost not available</span>}
        </SampleRow>
        <SampleRow title="Reported deals" labels={<Label kind="Reported" />}>
          <span className="block text-right font-sans text-sm">
            {SAMPLE.deal}
            <span className="block text-xs font-medium text-muted">Price undisclosed</span>
          </span>
        </SampleRow>
        <SampleRow title="Original cost" labels={<Label kind="Sourced" />}>
          {fmtMusd(SAMPLE.originalCostMusd)}
        </SampleRow>
      </ul>
      <Link
        href={`/vessel/${SAMPLE.imo}`}
        className="flex items-center justify-between border-t border-line bg-paper px-4 py-3 text-sm font-semibold text-harbor transition hover:bg-harbor-tint"
      >
        Open the full vessel page <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

function SampleRow({ title, labels, children }: { title: string; labels: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div>
        <p className="text-ink/80">{title}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">{labels}</div>
      </div>
      <div className="font-display text-2xl tabular-nums text-ink">{children}</div>
    </li>
  );
}
