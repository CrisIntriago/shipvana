import { ComingSoon } from '@/components/coming-soon';

export default function Page() {
  return (
    <ComingSoon
      eyebrow="My alerts"
      title="Get told when a deal matches"
      description="Save criteria once. When a matching event is saved, the bell lights up and the inbox gets a notification."
      workstream="Workstream B · Alerts + inbox"
      checklist={[
        'List my alerts with match count; create, edit, pause and delete',
        'Only filled-in criteria are tested (spec §6, lib/core/alerts.ts)',
        'Seeded demo alert "Any Carnival Corporation sale with an undisclosed price" matches Seabourn Sojourn and Costa Fortuna',
        '"Check now" button runs the same rules over all events',
        'Signed-in users only',
      ]}
      files={['app/alerts/page.tsx', 'app/actions/alerts.ts (new)', 'lib/core/alerts.ts', 'lib/server/store.ts']}
    />
  );
}
