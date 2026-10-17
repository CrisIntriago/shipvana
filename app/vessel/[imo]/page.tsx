import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEventsForVessel, getPolicies, getScrapPrices, getVessel } from '@/lib/server/queries';
import { imoIsValid, policyBookValueMusd } from '@/lib/core/valuation';
import type { VesselEvent } from '@/lib/core/types';
import {
  EXCLUDED_FROM_PRICE_COMPARISON,
  Label,
  OrBlank,
  PriceCell,
  PublicBadge,
  fmtMusd,
  fmtNum,
} from '@/components/labels';
import { ScrapCard } from '@/components/vessel/scrap-card';
import { PageHeader, Panel, SectionLabel } from '@/components/ui';
import { photoForImo } from '@/lib/ship-photos';
import { ExternalLink, Info, Ruler, Scale } from 'lucide-react';

export default function VesselPage(props: PageProps<'/vessel/[imo]'>) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted">Loading ship…</div>}>
      <VesselDetail params={props.params} />
    </Suspense>
  );
}

async function VesselDetail({ params }: { params: PageProps<'/vessel/[imo]'>['params'] }) {
  const { imo } = await params;
  if (!imoIsValid(imo)) notFound();
  const [vessel, events, scrapPrices, policies] = await Promise.all([
    getVessel(imo),
    getEventsForVessel(imo),
    getScrapPrices(),
    getPolicies(),
  ]);
  if (!vessel) notFound();

  const carnival = policies.find((p) => p.company === 'Carnival Corporation');
  const nclh = policies.find((p) => p.company === 'Norwegian Cruise Line Holdings');
  const policyValue = policyBookValueMusd({
    originalCostMusd: vessel.original_cost_musd,
    age: vessel.age_2026,
    usefulLife: carnival?.useful_life_years ?? 30,
    residualPct: carnival?.residual_pct_of_cost ?? 15,
  });

  return (
    <div>
      <PageHeader
        back={{ href: '/fleet', label: 'Fleet' }}
        photo={photoForImo(vessel.imo)}
        eyebrow={
          <>
            IMO <span className="font-mono tracking-normal">{vessel.imo}</span>
          </>
        }
        title={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {vessel.name}
            <PublicBadge status={vessel.public_status} ticker={vessel.ticker} />
          </span>
        }
        description={
          <>
            {vessel.brand} · {vessel.parent_company} ·{' '}
            {vessel.public_status === 'PUBLIC' ? 'Files with the SEC' : 'Private: no public financial filings expected'}
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Ship facts */}
        <Panel as="aside" className="h-fit p-5 text-sm lg:sticky lg:top-24">
          <SectionLabel icon={<Ruler className="h-3.5 w-3.5" aria-hidden />} className="mb-4">Ship facts</SectionLabel>
          <dl className="space-y-2">
            <Fact k="Year built" v={`${vessel.year_built} (age ${vessel.age_2026} in 2026)`} />
            <Fact k="Gross tonnage" v={vessel.gross_tonnage !== null ? fmtNum(vessel.gross_tonnage, 0) : null} />
            <Fact k="Passengers (double occ.)" v={vessel.passengers_double_occ !== null ? fmtNum(vessel.passengers_double_occ, 0) : null} />
            <Fact k="Builder" v={vessel.builder} />
            <Fact k="Build country" v={vessel.build_country} />
            <Fact k="Length" v={vessel.length_m !== null ? `${vessel.length_m} m` : null} />
            <Fact k="Beam" v={vessel.beam_m !== null ? `${vessel.beam_m} m` : null} />
            <Fact k="Draft" v={vessel.draft_m !== null ? `${vessel.draft_m} m` : null} />
            <Fact k="Miami" v={vessel.miami_connection} />
          </dl>
        </Panel>

        <div className="space-y-6">
          {/* Four valuation cards */}
          <section>
            <SectionLabel icon={<Scale className="h-3.5 w-3.5" aria-hidden />} className="mb-3">Four labelled values</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ScrapCard
                estLdt={vessel.EST_ldt_tonnes}
                ldtBasis={vessel.EST_ldt_basis}
                regions={scrapPrices.map((r) => ({ region: r.region, usd_per_ldt_dry: r.usd_per_ldt_dry, as_of: r.as_of }))}
              />

              <Card title="Policy book value" labels={<><Label kind="Estimate" /><Label kind="Carnival policy applied" /></>}>
                {policyValue !== null ? (
                  <>
                    <Big>{fmtMusd(policyValue, { estimate: true })}</Big>
                    <Note>
                      Original cost × (1 − 0.85 × min(age, 30) ÷ 30). {carnival?.useful_life_years}-year straight line to{' '}
                      {carnival?.residual_pct_of_cost}% residual, from Carnival&apos;s {carnival?.status?.replace('SOURCED - ', '')}.
                    </Note>
                  </>
                ) : (
                  <>
                    <Big muted>Original cost not available</Big>
                    <Note>Policy book value needs the original cost; it is blank in the source.</Note>
                  </>
                )}
                {nclh?.management_view_service_life_years && (
                  <Note>
                    Management view: ships can last {nclh.management_view_service_life_years}+ years (NCLH). 30 years is an accounting life,
                    not a retirement age.
                  </Note>
                )}
              </Card>

              <Card title="Reported deals" labels={<Label kind="Reported" />}>
                {events.length === 0 ? (
                  <>
                    <Big muted>No reported deals</Big>
                    <Note>No sale, charter or exit has been recorded for this IMO.</Note>
                  </>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {events.map((e) => (
                      <li key={e.id} className="border-l-2 border-line pl-2.5">
                        <span className="font-medium">{e.event_type}</span> · {e.event_date ?? 'date n/a'}
                        <div>
                          <PriceCell price={e.price_musd} status={e.price_status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Note>Prices are shown only as reported. We never calculate or fill in a missing price.</Note>
              </Card>

              <Card title="Original cost" labels={<Label kind="Sourced">Sourced · Wikipedia</Label>}>
                {vessel.original_cost_musd !== null ? (
                  <>
                    <Big>{fmtMusd(vessel.original_cost_musd, { digits: 0 })}</Big>
                    <Note>Build cost as reported, nominal USD, built {vessel.year_built}.</Note>
                  </>
                ) : (
                  <Big muted>Original cost not available</Big>
                )}
              </Card>
            </div>
          </section>

          {/* Events and evidence */}
          <Panel as="section" className="p-5">
            <SectionLabel icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden />} className="mb-4">Events and sources</SectionLabel>
            {events.length === 0 ? (
              <p className="text-sm text-muted">
                No events yet. Events that name this ship without an IMO sit in the Needs IMO list until one is attached.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </div>
            )}
          </Panel>

        </div>
      </div>
      </div>
    </div>
  );
}

function EventRow({ e }: { e: VesselEvent }) {
  const excluded = EXCLUDED_FROM_PRICE_COMPARISON.includes(e.event_type);
  return (
    <div className="rounded-lg border border-line bg-paper/60 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{e.event_type}</span>
        <span className="text-muted">{e.event_date ?? 'date n/a'}</span>
        <span className="rounded-md bg-harbor-tint px-1.5 py-0.5 text-xs font-medium text-harbor">{e.status}</span>
        <PriceCell price={e.price_musd} status={e.price_status} />
      </div>
      <p className="mt-1.5 text-ink/80">
        Counterparty: <OrBlank value={e.counterparty} blank="undisclosed" />
      </p>
      {e.note && (
        <p className={`mt-1 text-xs ${excluded ? 'flex gap-1.5 rounded-md bg-amber-50 p-2 text-amber-900' : 'text-muted'}`}>
          {excluded && <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />}
          <span>
            {excluded && <strong>Excluded from price comparisons. </strong>}
            {e.note}
          </span>
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Source:{' '}
        {e.source_url ? (
          <a href={e.source_url} target="_blank" rel="noreferrer" className="text-harbor hover:underline">
            {e.source ?? e.source_url}
          </a>
        ) : (
          (e.source ?? 'not recorded')
        )}{' '}
        · {e.evidence_status}
      </p>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line/70 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-ink">
        <OrBlank value={v} />
      </dd>
    </div>
  );
}

function Card({ title, labels, children }: { title: string; labels: React.ReactNode; children: React.ReactNode }) {
  return (
    <Panel className="flex flex-col p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-1.5 flex flex-wrap gap-1">{labels}</div>
      {children}
    </Panel>
  );
}

function Big({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <p className={`mt-3 tabular-nums ${muted ? 'text-base font-semibold text-muted/70' : 'font-display text-4xl text-ink'}`}>{children}</p>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs leading-relaxed text-muted">{children}</p>;
}
