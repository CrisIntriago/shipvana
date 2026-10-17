import { ComingSoon } from '@/components/coming-soon';

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Inbox"
      title="Your notifications"
      description="In-app only. No email, no SMS."
      workstream="Workstream B · Alerts + inbox"
      checklist={[
        'List notifications newest first: "Alert matched: {ship_name}" with the body from spec §6',
        'Each links to the vessel page, or the event when no vessel matched',
        'Mark as read; the header bell count updates',
      ]}
      files={['app/inbox/page.tsx', 'app/actions/alerts.ts (new)', 'components/header.tsx (bell)']}
    />
  );
}
