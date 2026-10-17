# SHIPVANA: what's left (demo today, 2026-10-17)

Spec: [public/shipvana/CLAUDE.md](../public/shipvana/CLAUDE.md). Rules that apply to everything are in the root [CLAUDE.md](../CLAUDE.md): every number labelled, never fill a blank, never guess an IMO, maths in code, never in the AI.

## Start here (new to the repo)

1. `git pull && npm install && npm run dev`, then open http://localhost:3000.
2. Sign in with the demo user dropdown at the top right: Analyst, Contributor or Admin. No passwords.
3. Read the "Done when" checklist on your page (for example `/alerts`); it is the acceptance list for that page.
4. Copy the look from `app/fleet/page.tsx`:
   - Page: `<PageHeader>` band, then `<div className="mx-auto max-w-7xl px-4 py-8">`.
   - Cards: `<Panel>`. Buttons: `buttonClass(...)`. Inputs: `inputClass`.
   - Use theme colours (`text-ink`, `text-muted`, `border-line`, `bg-harbor`, `text-brass`), not raw `slate`/`blue`.
   - Icons come from `lucide-react`.
5. Next.js 16 differs from older versions: check `node_modules/next/dist/docs/` before using a Next API.
   - `params` and `searchParams` are Promises.
   - Wrap request-time data in `<Suspense>` (Cache Components is on).
   - Use `preload`, not `priority`, on images.
6. If styles look unstyled after editing `app/globals.css`, restart `npm run dev` (Turbopack caches the CSS).

## Already done

- **Fleet** (`/fleet`): search, filters, grid and table views, ship photos.
- **Vessel** (`/vessel/[imo]`): the four labelled values, facts, events with sources.
- **Logic** (`lib/core/`): valuation, finance (NPV/IRR/FV/payback) and alert matching, all tested.
- **Data and auth** (`lib/server/`): store, demo sign-in with roles, `saveEvent`, `setEventImo`, `runAlertMatching`, `runAlertMatchingAll`.
- **UI kit** (`components/ui.tsx`): `PageHeader`, `Panel`, `SectionLabel`, `buttonClass`, `inputClass`, `Field`, `ShipImage`. Labels are in `components/labels.tsx`.
- **Placeholders**: each unbuilt page shows its own "Done when" checklist and file list. Replace the `<ComingSoon>` call with a `<PageHeader>` and the real content.

## Split: two lanes, no shared files

| | Lane 1: AI (needs `ANTHROPIC_API_KEY`) | Lane 2: no AI |
|---|---|---|
| Owner | ________ | ________ |
| 1st (≈15 min) | **Event Feed** `/events`: list + "Needs IMO" + "Add event from text" (extract, review, save) | **Alerts** `/alerts`: list + create + seeded Carnival demo alert + "Check now" button |
| 2nd (≈10 min) | **Advisor** `/advisor?imo=`: memo from the four values | **Inbox** `/inbox`: notifications list + mark read |
| If time | Memo panel on the vessel page (`#memo`) | **Scenarios** `/scenarios`: Mode 1 Buy vs Lease with the reference case |
| Files you own | `app/events/*`, `app/advisor/*`, `app/actions/events.ts`, `app/actions/advisor.ts`, `lib/server/ai.ts` | `app/alerts/*`, `app/inbox/*`, `app/scenarios/*`, `app/actions/alerts.ts`, `app/actions/scenarios.ts` |

Shared and touched only if you must: `lib/server/store.ts` and `lib/server/queries.ts`. If you need a helper, **add a new function at the end**; don't edit existing ones, so merges stay clean.

## Lane 1 notes

- Install the SDK: `npm i @anthropic-ai/sdk`. Put the key in `.env.local` as `ANTHROPIC_API_KEY`, server only, never commit it.
- Put the `extractVesselEvent` prompt from spec §7 in `lib/server/ai.ts` exactly as written.
- After extraction:
  - Check each IMO with `imoIsValid` (`lib/core/valuation.ts`) and match it to a vessel; anything unmatched has no IMO.
  - Show a review table; call `saveEvent` only on confirm, which runs alert matching.
- Adding events needs `can.addEvent` (Contributor or Admin); the memo needs `can.useAi` (`lib/server/session.ts`).
- Memo: first line is the ship's IMO, it states the disclosure basis, stays under 200 words, and calls itself "Decision support, not financial advice."

## Lane 2 notes

- The demo alert is **already seeded** (`alert_demo` in `lib/server/store.ts`), and the seed data already fires it for Seabourn Sojourn and Costa Fortuna. Lane 2 only needs the UI on top: `getAlertsFor(userId)` and `getNotificationsFor(userId)` in `lib/server/queries.ts`.
- "Check now" calls `runAlertMatchingAll()`. The header bell already counts unread notifications.
- Scenarios: call `lib/core/finance.ts` (don't re-implement it). Reference case: BUY NPV 57.54, IRR 11.50%. Label the 8% rate "Assumption"; everything else is "Your input".

## Last 5 minutes (both)

1. Run `npx tsc --noEmit && npm run lint && cd public/shipvana && node --test tests/all.test.mjs`.
2. Deploy and open the URL in a private window. Make the GitHub repo public (acceptance item 6).
3. Demo path: Fleet → Norwegian Sky → Event Feed paste → alert fires → bell → Advisor memo.

## Before presenting (spec §12)

- Re-verify the Sep 2026 scrap rates and the Carnival depreciation note.
- NCLH and Royal Caribbean policies are NOT VERIFIED; say so if asked.
- Rotate any API keys pasted into earlier chats.
