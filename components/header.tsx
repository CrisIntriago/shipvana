import Link from 'next/link';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/server/session';
import { getNotificationsFor } from '@/lib/server/queries';
import { USERS } from '@/lib/server/store';
import { switchUser } from '@/app/actions/session';
import { UserSelect } from './user-select';

const NAV = [
  { href: '/fleet', label: 'Fleet' },
  { href: '/events', label: 'Event Feed' },
  { href: '/advisor', label: 'Advisor' },
  { href: '/scenarios', label: 'Scenario Analyzer' },
  { href: '/alerts', label: 'My alerts' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900">SHIPVANA</span>
          <span className="hidden text-xs text-slate-500 sm:inline">cruise ship valuation · PortMiami</span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action="/fleet" className="ml-auto">
          <input
            name="q"
            placeholder="Search IMO or name"
            className="w-44 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </form>
        <Suspense fallback={<div className="h-7 w-48" />}>
          <UserArea />
        </Suspense>
      </div>
    </header>
  );
}

async function UserArea() {
  const user = await getCurrentUser();
  const unread = user ? (await getNotificationsFor(user.id)).filter((n) => !n.read).length : 0;
  return (
    <div className="flex items-center gap-3">
      {user && (
        <Link href="/inbox" className="relative rounded p-1 text-slate-600 hover:bg-slate-100" aria-label={`Inbox, ${unread} unread`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-4 text-white">
              {unread}
            </span>
          )}
        </Link>
      )}
      <form action={switchUser}>
        <UserSelect users={USERS.map((u) => ({ id: u.id, name: u.name }))} current={user?.id ?? ''} />
      </form>
    </div>
  );
}
