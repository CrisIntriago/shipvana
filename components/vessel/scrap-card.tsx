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
    <div className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,27,40,0.04)]">
      <h3 className="text-sm font-semibold text-ink">Scrap value</h3>
      <div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {userLdt ? <Label kind="Your input">LDT: Your input</Label> : <Label kind="Estimate" />}
          <Label kind="Proxy">Rate: Proxy</Label>
        </div>
      </div>
      <p className="mt-3 font-display text-4xl tabular-nums text-ink">
        {value !== null ? fmtMusd(value, { estimate: !userLdt }) : <span className="font-sans text-base font-semibold text-muted/70">LDT not available</span>}
      </p>
      <div className="mt-3 space-y-2 text-xs text-muted">
        <label className="flex flex-col gap-1">
          <span>Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-md border border-line bg-white px-1.5 py-1 text-ink focus:border-harbor focus:outline-none">
            {usable.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region} · ${r.usd_per_ldt_dry}/LDT
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span>Your LDT (tonnes)</span>
          <input
            inputMode="numeric"
            value={ldtInput}
            onChange={(e) => setLdtInput(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={estLdt !== null ? `~${fmtNum(estLdt, 0)}` : 'enter LDT'}
            className="w-full rounded-md border border-line bg-white px-1.5 py-1 text-right text-ink focus:border-harbor focus:outline-none"
          />
        </label>
        <p className="leading-relaxed">
          {userLdt ? 'Using your LDT.' : `Estimated LDT ${estLdt !== null ? `~${fmtNum(estLdt, 0)} t` : 'n/a'}${ldtBasis ? ` (${ldtBasis})` : ''}.`} Dry-cargo
          scrap rate as of {rate?.as_of ?? 'n/a'}, used as a proxy for cruise ships.
        </p>
      </div>
    </div>
  );
}
