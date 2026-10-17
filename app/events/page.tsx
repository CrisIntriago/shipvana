import { ComingSoon } from '@/components/coming-soon';

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Event Feed"
      title="Sales, charters and exits"
      description="Every reported deal with its state and source. Events without an IMO wait in the Needs IMO list."
      workstream="Workstream A · Events + AI extraction"
      checklist={[
        'Feed lists all 5 seeded events with status, price (or "Price undisclosed") and source link',
        '"Needs IMO" list shows the 4 events with no matched IMO; a user can attach a valid IMO',
        '"Add event from text": paste text → extractVesselEvent → review table → save only on confirm',
        'Extracted IMOs are checked with imoIsValid; never guessed. Only the source link is stored',
        'Saving (or matching an IMO later) runs alert matching',
        'Contributor or Admin role required to add events',
      ]}
      files={['app/events/page.tsx', 'app/actions/events.ts (new)', 'lib/server/ai.ts (new)', 'lib/server/queries.ts', 'lib/server/store.ts']}
    />
  );
}
