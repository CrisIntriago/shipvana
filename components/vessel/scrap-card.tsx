'use client';
import { useState } from 'react';
import { scrapValueMusd } from '@/lib/core/valuation';
import { Label, fmtMusd, fmtNum } from '@/components/labels';

type Region = { region: string; usd_per_ldt_dry: number | null; as_of: string | null };

// Card 1: Scrap value = LDT x usd_per_ldt_dry / 1,000,000. Rate is a Proxy (dry-cargo rate). User may type a real LDT.
export function ScrapCard({ estLdt, ldtBasis, regions }: { estLdt: number | null; ldtBasis: string | null; regions: Region[] }) {
  const usable = regions.filter((r) => r.usd_per_ldt_dry !== null);
  const [region, setRegion] = useState(usable.find((r) => r.region === 'Bangladesh')?.region ?? usable[0]?.region ?? '');
  const [ldtInput, setLdtInput] = useState('');

  const rate = usable.find((r) => r.region === region);
  const userLdt = ldtInput.trim() !== '' && Number(ldtInput) > 0 ? Number(ldtInput) : null;
  const ldt = userLdt ?? estLdt;
  const value = ldt !== null && rate?.usd_per_ldt_dry != null ? scrapValueMusd({ ldtTonnes: ldt, usdPerLdtDry: rate.usd_per_ldt_dry }) : null;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Scrap value</h3>
        <div className="flex flex-wrap justify-end gap-1">
          {userLdt ? <Label kind="Your input">LDT: Your input</Label> : <Label kind="Estimate" />}
          <Label kind="Proxy">Rate: Proxy</Label>
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">
        {value !== null ? fmtMusd(value, { estimate: !userLdt }) : <span className="text-base text-slate-400">LDT not available</span>}
      </p>
      <div className="mt-3 space-y-2 text-xs text-slate-600">
        <label className="flex items-center justify-between gap-2">
          <span>Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded border border-slate-300 px-1.5 py-0.5">
            {usable.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region} · ${r.usd_per_ldt_dry}/LDT
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between gap-2">
          <span>Your LDT (tonnes)</span>
          <input
            inputMode="numeric"
            value={ldtInput}
            onChange={(e) => setLdtInput(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={estLdt !== null ? `~${fmtNum(estLdt, 0)}` : 'enter LDT'}
            className="w-28 rounded border border-slate-300 px-1.5 py-0.5 text-right"
          />
        </label>
        <p className="text-slate-500">
          {userLdt ? 'Using your LDT.' : `Estimated LDT ${estLdt !== null ? `~${fmtNum(estLdt, 0)} t` : 'n/a'}${ldtBasis ? ` (${ldtBasis})` : ''}.`} Dry-cargo
          scrap rate as of {rate?.as_of ?? 'n/a'}, used as a proxy for cruise ships.
        </p>
      </div>
    </div>
  );
}
