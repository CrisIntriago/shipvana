import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getVessels } from '@/lib/server/queries';
import { PublicBadge, fmtMusd, Label, OrBlank, fmtNum } from '@/components/labels';

export default function FleetPage(props: PageProps<'/fleet'>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Fleet</h1>
      <p className="mt-1 text-sm text-slate-600">Cruise ships that call at PortMiami. Search by IMO or name, or filter.</p>
      <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Loading fleet…</p>}>
        <FleetTable searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

async function FleetTable({ searchParams }: { searchParams: PageProps<'/fleet'>['searchParams'] }) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const brand = one(sp.brand);
  const parent = one(sp.parent);
  const status = one(sp.status);
  const maxAge = one(sp.maxAge);

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

  const select = 'rounded border border-slate-300 bg-white px-2 py-1.5 text-sm';
  return (
    <>
      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4" action="/fleet">
        <Field label="IMO or name">
          <input name="q" defaultValue={q} placeholder="e.g. 9837456" className={`${select} w-40`} />
        </Field>
        <Field label="Brand">
          <select name="brand" defaultValue={brand} className={select}>
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Parent company">
          <select name="parent" defaultValue={parent} className={`${select} max-w-60`}>
            <option value="">All parents</option>
            {parents.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Public / private">
          <select name="status" defaultValue={status} className={select}>
            <option value="">Any</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </Field>
        <Field label="Max age (2026)">
          <input name="maxAge" type="number" min={0} defaultValue={maxAge} className={`${select} w-24`} />
        </Field>
        <button className="rounded bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700">Apply</button>
        <Link href="/fleet" className="px-1 py-1.5 text-sm text-slate-500 hover:text-slate-800">
          Reset
        </Link>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        {rows.length} of {vessels.length} ships. <Label kind="Estimate" /> values are calculated, shown with ~.
      </p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Ship</th>
              <th className="px-3 py-2">IMO</th>
              <th className="px-3 py-2">Brand / parent</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Built (age)</th>
              <th className="px-3 py-2 text-right">GT</th>
              <th className="px-3 py-2 text-right">Scrap value (BD)</th>
              <th className="px-3 py-2 text-right">Original cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((v) => (
              <tr key={v.imo} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link href={`/vessel/${v.imo}`} className="font-semibold text-blue-700 hover:underline">
                    {v.name}
                  </Link>
                  <div className="text-xs text-slate-500">{v.miami_connection}</div>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{v.imo}</td>
                <td className="px-3 py-2">
                  {v.brand}
                  <div className="text-xs text-slate-500">{v.parent_company}</div>
                </td>
                <td className="px-3 py-2">
                  <PublicBadge status={v.public_status} ticker={v.ticker} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {v.year_built} ({v.age_2026})
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <OrBlank value={v.gross_tonnage !== null ? fmtNum(v.gross_tonnage, 0) : null} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <OrBlank
                    value={v.EST_scrap_value_musd_bangladesh !== null ? fmtMusd(v.EST_scrap_value_musd_bangladesh, { estimate: true }) : null}
                  />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <OrBlank value={v.original_cost_musd !== null ? fmtMusd(v.original_cost_musd, { digits: 0 }) : null} blank="Not available" />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  No ships match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      {children}
    </label>
  );
}
