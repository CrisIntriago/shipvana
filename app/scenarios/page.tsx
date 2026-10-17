import { ComingSoon } from '@/components/coming-soon';

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Scenario Analyzer"
      title="Buy, lease, trade in or sell"
      description="NPV, IRR, FV and payback on figures you enter. All maths runs in code (lib/core/finance.ts), never in the AI."
      workstream="Workstream D · Scenario Analyzer"
      checklist={[
        'Mode 1 (buying/expanding): Buy vs Lease, and Keep / Expand / Trade-in, ranked by NPV, with NPV vs baseline',
        'Mode 2 (selling/retiring): Sell now, Scrap, Charter then sell, Keep then sell; best option, "close call" under 5%',
        'Sensitivity: NPV at r−2, r, r+2. Default 8% labelled "Assumption, change it"; other inputs "Your input"',
        'Residual defaults to scrap only when blank, labelled "Estimate (scrap floor)"',
        'Reference case reproduces BUY NPV 57.54, IRR 11.50%',
        'Mode 2 shows count of matching saved alerts (no names); Saved scenarios list per user',
      ]}
      files={['app/scenarios/page.tsx', 'app/actions/scenarios.ts (new)', 'lib/core/finance.ts', 'lib/server/store.ts (scenario_run)']}
    />
  );
}
