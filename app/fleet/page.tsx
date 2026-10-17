import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LayoutGrid, Rows3, SlidersHorizontal } from 'lucide-react';
import { getVessels } from '@/lib/server/queries';
import type { Vessel } from '@/lib/core/types';
import { photoForImo } from '@/lib/ship-photos';
import { PublicBadge, fmtMusd, Label, OrBlank, fmtNum } from '@/components/labels';
import { Field, PageHeader, Panel, ShipImage, buttonClass, inputClass } from '@/components/ui';

export default function FleetPage(props: PageProps<'/fleet'>) {
  return (
    <div>
      <PageHeader
        eyebrow="Fleet"
        title="Cruise ships that call at PortMiami"
        description="Search by IMO or name, or filter by brand, owner, listing and age. An exact IMO opens the ship page."
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<p className="text-sm text-muted">Loading fleet…</p>}>
          <FleetResults searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

async function FleetResults({ searchParams }: { searchParams: PageProps<'/fleet'>['searchParams'] }) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const brand = one(sp.brand);
  const parent = one(sp.parent);
  const status = one(sp.status);
  const maxAge = one(sp.maxAge);
  const view = one(sp.view) === 'table' ? 'table' : 'grid';

  const vessels = await getVessels();

  // An exact IMO goes straight to the ship page.
  const imoQuery = q.replace(/^IMO\s*/i, '');
  if (/^\d{7}$/.test(imoQuery) && vessels.some((v) => v.imo === imoQuery)) redirect(`/vessel/${imoQuery}`);

  const brands = [...new Set(vessels.map((v) => v.brand))].sort();
  const parents = [...new Set(vessels.map((v) => v.parent_company))].sort();

  const rows = vessels.filter(
    (v) =>
      (!q || v.name.toLowerCase().includes(q.toLowerCase()) || v.imo.includes(imoQuery)) &&
      (!brand || v.brand === brand) &&
      (!parent || v.parent_company === parent) &&
      (!status || v.public_status === status) &&
      (!maxAge || v.age_2026 <= Number(maxAge)),
  );

  const viewHref = (next: 'grid' | 'table') => {
    const params = new URLSearchParams(Object.entries({ q, brand, parent, status, maxAge }).filter(([, v]) => v));
    if (next === 'table') params.set('view', 'table');
    const s = params.toString();
    return s ? `/fleet?${s}` : '/fleet';
  };

  return (
    <>
      <Panel className="p-4">
        <form className="flex flex-wrap items-end gap-3" action="/fleet">
          {view === 'table' && <input type="hidden" name="view" value="table" />}
          <Field label="IMO or name">
            <input name="q" defaultValue={q} placeholder="e.g. 9837456" className={`${inputClass} w-44`} />
          </Field>
          <Field label="Brand">
            <select name="brand" defaultValue={brand} className={inputClass}>
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Parent company">
            <select name="parent" defaultValue={parent} className={`${inputClass} max-w-60`}>
              <option value="">All parents</option>
              {parents.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Public / private">
            <select name="status" defaultValue={status} className={inputClass}>
              <option value="">Any</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </Field>
          <Field label="Max age (2026)">
            <input name="maxAge" type="number" min={0} defaultValue={maxAge} className={`${inputClass} w-28`} />
          </Field>
          <button className={buttonClass('primary')}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Apply
          </button>
          <Link href={view === 'table' ? '/fleet?view=table' : '/fleet'} className={buttonClass('ghost')}>
            Reset
          </Link>
        </form>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <span className="font-semibold text-ink">{rows.length}</span> of {vessels.length} ships ·
          <Label kind="Estimate" /> values are calculated, shown with ~
        </p>
        <div className="flex rounded-lg border border-line bg-white p-0.5 text-sm" role="group" aria-label="View">
          {(['grid', 'table'] as const).map((v) => {
            const Icon = v === 'grid' ? LayoutGrid : Rows3;
            return (
              <Link
                key={v}
                href={viewHref(v)}
                aria-current={view === v ? 'true' : undefined}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 capitalize transition ${
                  view === v ? 'bg-abyss text-white' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden /> {v}
              </Link>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <Panel className="mt-4 px-4 py-12 text-center text-muted">No ships match these filters.</Panel>
      ) : view === 'grid' ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((v) => (
            <ShipCard key={v.imo} v={v} />
          ))}
        </div>
      ) : (
        <FleetTable rows={rows} />
      )}
    </>
  );
}

function ShipCard({ v }: { v: Vessel }) {
  return (
    <Panel as="article" className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/vessel/${v.imo}`} className="relative block">
        <ShipImage
          photo={photoForImo(v.imo)}
          alt={v.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/9] [&_img]:transition [&_img]:duration-500 [&_img]:group-hover:scale-105"
          showCredit={false}
        />
        <div className="absolute left-3 top-3">
          <PublicBadge status={v.public_status} ticker={v.ticker} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-xs text-muted">IMO {v.imo}</p>
        <Link href={`/vessel/${v.imo}`} className="font-display text-2xl leading-tight text-ink hover:text-harbor">
          {v.name}
        </Link>
        <p className="text-sm text-muted">
          {v.brand}
          {v.brand !== v.parent_company && <> · {v.parent_company}</>}
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
          <Stat k="Built" v={`${v.year_built} (${v.age_2026}y)`} />
          <Stat k="Gross tonnage" v={v.gross_tonnage !== null ? fmtNum(v.gross_tonnage, 0) : null} />
          <Stat
            k="Scrap (BD)"
            v={v.EST_scrap_value_musd_bangladesh !== null ? fmtMusd(v.EST_scrap_value_musd_bangladesh, { estimate: true }) : null}
          />
        </dl>
        {v.miami_connection && <p className="mt-3 line-clamp-2 text-xs text-muted">{v.miami_connection}</p>}
      </div>
    </Panel>
  );
}

function Stat({ k, v }: { k: string; v: string | null }) {
  return (
    <div>
      <dt className="text-muted">{k}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-ink">
        <OrBlank value={v} blank="n/a" />
      </dd>
    </div>
  );
}

function FleetTable({ rows }: { rows: Vessel[] }) {
  return (
    <Panel className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="border-b border-line bg-paper text-left text-[11px] uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Ship</th>
            <th className="px-3 py-3 font-semibold">IMO</th>
            <th className="px-3 py-3 font-semibold">Brand / parent</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 text-right font-semibold">Built (age)</th>
            <th className="px-3 py-3 text-right font-semibold">GT</th>
            <th className="px-3 py-3 text-right font-semibold">Scrap value (BD)</th>
            <th className="px-4 py-3 text-right font-semibold">Original cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((v) => (
            <tr key={v.imo} className="transition hover:bg-harbor-tint/50">
              <td className="px-4 py-3">
                <Link href={`/vessel/${v.imo}`} className="font-semibold text-harbor hover:underline">
                  {v.name}
                </Link>
                <div className="text-xs text-muted">{v.miami_connection}</div>
              </td>
              <td className="px-3 py-3 font-mono text-xs">{v.imo}</td>
              <td className="px-3 py-3">
                {v.brand}
                <div className="text-xs text-muted">{v.parent_company}</div>
              </td>
              <td className="px-3 py-3">
                <PublicBadge status={v.public_status} ticker={v.ticker} />
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                {v.year_built} ({v.age_2026})
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                <OrBlank value={v.gross_tonnage !== null ? fmtNum(v.gross_tonnage, 0) : null} />
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                <OrBlank
                  value={v.EST_scrap_value_musd_bangladesh !== null ? fmtMusd(v.EST_scrap_value_musd_bangladesh, { estimate: true }) : null}
                />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                <OrBlank value={v.original_cost_musd !== null ? fmtMusd(v.original_cost_musd, { digits: 0 }) : null} blank="Not available" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
