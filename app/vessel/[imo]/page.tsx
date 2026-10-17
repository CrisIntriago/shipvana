import Link from 'next/link';
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

export default function VesselPage(props: PageProps<'/vessel/[imo]'>) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500">Loading ship…</div>}>
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/fleet" className="text-sm text-slate-500 hover:text-slate-800">
        ← Fleet
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{vessel.name}</h1>
        <PublicBadge status={vessel.public_status} ticker={vessel.ticker} />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        IMO <span className="font-mono">{vessel.imo}</span> · {vessel.brand} · {vessel.parent_company} ·{' '}
        {vessel.public_status === 'PUBLIC' ? 'Files with the SEC' : 'Private: no public financial filings expected'}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Ship facts */}
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Ship facts</h2>
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
        </aside>

        <div className="space-y-6">
          {/* Four valuation cards */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Four labelled values</h2>
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
                      <li key={e.id}>
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
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Events and sources</h2>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">
                No events yet. Events that name this ship without an IMO sit in the{' '}
                <Link href="/events" className="text-blue-700 hover:underline">
                  Needs IMO list
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </div>
            )}
          </section>

          {/* Advisor memo panel (placeholder until the Advisor workstream lands) */}
          <section id="memo" className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision memo</h2>
            <p className="mt-2 text-sm text-slate-500">
              A plain-language memo built from the four values above. Sign in and generate it on the{' '}
              <Link href={`/advisor?imo=${vessel.imo}`} className="text-blue-700 hover:underline">
                Advisor
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function EventRow({ e }: { e: VesselEvent }) {
  const excluded = EXCLUDED_FROM_PRICE_COMPARISON.includes(e.event_type);
  return (
    <div className="rounded border border-slate-200 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{e.event_type}</span>
        <span className="text-slate-500">{e.event_date ?? 'date n/a'}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{e.status}</span>
        <PriceCell price={e.price_musd} status={e.price_status} />
      </div>
      <p className="mt-1 text-slate-600">
        Counterparty: <OrBlank value={e.counterparty} blank="undisclosed" />
      </p>
      {e.note && (
        <p className={`mt-1 text-xs ${excluded ? 'rounded bg-amber-50 p-2 text-amber-900' : 'text-slate-500'}`}>
          {excluded && <strong>Excluded from price comparisons. </strong>}
          {e.note}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500">
        Source:{' '}
        {e.source_url ? (
          <a href={e.source_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
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
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right">
        <OrBlank value={v} />
      </dd>
    </div>
  );
}

function Card({ title, labels, children }: { title: string; labels: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <div className="flex flex-wrap justify-end gap-1">{labels}</div>
      </div>
      {children}
    </div>
  );
}

function Big({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <p className={`mt-3 font-bold tabular-nums ${muted ? 'text-base text-slate-400' : 'text-3xl'}`}>{children}</p>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-slate-500">{children}</p>;
}
