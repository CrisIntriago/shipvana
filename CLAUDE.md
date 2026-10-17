@AGENTS.md

# SHIPVANA

**The product is named SHIPVANA.** It was previously called "Second Hull" — that name is retired. Never use "Second Hull" (or `secondHull`, `second-hull`, `sh_`) in UI copy, metadata, identifiers, docs, or commit messages. Use "SHIPVANA" in user-facing text and `shipvana` in code identifiers/paths.

SHIPVANA is a transparent valuation and tracking web app for cruise ships that call at PortMiami (eMerge America hackathon, Enterprise AI track, 2026-10-17). Users look up a ship by IMO and see four labelled values, an event feed, alerts, an AI decision memo, and a scenario analyzer.

## Source of truth

- **Spec:** [public/shipvana/CLAUDE.md](public/shipvana/CLAUDE.md) — read it before building features. Sections are referenced in code as "Part D/F/G/L".
- **Data:** the CSVs in `public/shipvana/data/` are authoritative (not the old Archie schema).
- **Reference logic:** `public/shipvana/lib/*.mjs` + `public/shipvana/tests/all.test.mjs`. `lib/core/*.ts` are 1:1 TypeScript ports — behaviour must stay identical.

## Commands

- `npm run dev` / `npm run build` / `npm run lint`
- `npx tsc --noEmit` — typecheck
- `cd public/shipvana && node --test tests/all.test.mjs` — reference tests (must stay green before and after changes)

## Architecture

- Next.js 16 App Router with `cacheComponents` and `partialPrefetching` enabled (`next.config.ts`), React 19, Tailwind v4. Check `node_modules/next/dist/docs/` before using Next APIs.
- `lib/core/` — pure, framework-free logic: `valuation.ts` (IMO check digit, scrap, policy book value), `finance.ts` (NPV/IRR/FV/payback), `alerts.ts` (matching + notification text), `csv.ts`, `types.ts`.
- `lib/server/` — `server-only`. `store.ts` is the single data layer: reference tables seed from CSVs on boot; mutable tables persist to `.data/store.json` (gitignored), cached on `globalThis.__shipvanaStore`. `session.ts` is demo auth (cookie `sv_user`, roles analyst/contributor/admin, `can.*` permission checks). `queries.ts` holds read helpers.
- `app/actions/` — server actions. Pages: `/fleet`, `/vessel/[imo]`, `/events`, `/advisor`, `/alerts`, `/inbox`, `/scenarios`.
- `components/labels.tsx` — the value-label badges (Sourced / Estimate / Proxy / Your input / Assumption).

## Non-negotiable honesty rules (see spec §2)

- Every number carries a label. `EST_` columns show an Estimate badge and "~".
- Never fill a missing value: "Price undisclosed", "Original cost not available".
- Never guess an IMO; unmatched events go in "Needs IMO".
- All maths runs in code, never in the AI. The AI only extracts events and explains computed numbers.
- Wording: "Decision support, not financial advice."
- The Anthropic API key lives only in a server env var — never in client code or the repo.
