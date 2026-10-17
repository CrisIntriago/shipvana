import { ComingSoon } from '@/components/coming-soon';

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Advisor"
      title="A decision memo, from computed numbers"
      description="The AI explains the four values; it never calculates them. Decision support, not financial advice."
      workstream="Workstream C · Advisor memo"
      checklist={[
        'Pick a ship (?imo=…) and generate the memo with adviseDecision(imo); sign-in required',
        'First line names the ship by IMO; memo names the disclosure basis (public filing or private)',
        'Labels each value sourced or estimate, says where prices are undisclosed, under 200 words',
        'Calls itself "decision support, not financial advice"',
        'Shows the example repurposing plans from repurposing_scenarios_ESTIMATES.csv with Estimate badges',
        'Memo also appears as one panel on the vessel page (#memo)',
      ]}
      files={['app/advisor/page.tsx', 'app/actions/advisor.ts (new)', 'lib/server/ai.ts (new)', 'app/vessel/[imo]/page.tsx (#memo)']}
    />
  );
}
