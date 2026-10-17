import Link from 'next/link';
import { Suspense } from 'react';
import { Bell, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/session';
import { getNotificationsFor } from '@/lib/server/queries';
import { USERS } from '@/lib/server/store';
import { switchUser } from '@/app/actions/session';
import { NavLinks } from './nav-links';
import { UserSelect } from './user-select';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-abyss/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo tone="dark" />
        </Link>
        <div className="order-last w-full md:order-none md:w-auto">
          <Suspense fallback={<div className="h-8" />}>
            <NavLinks />
          </Suspense>
        </div>
        <form action="/fleet" className="relative ml-auto hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" aria-hidden />
          <label htmlFor="header-q" className="sr-only">
            Search IMO or name
          </label>
          <input
            id="header-q"
            name="q"
            placeholder="IMO or ship name"
            className="w-48 rounded-md border border-white/10 bg-white/5 py-1.5 pl-8 pr-2 text-sm text-white placeholder:text-white/40 focus:border-brass/60 focus:outline-none"
          />
        </form>
        <Suspense fallback={<div className="ml-auto h-8 w-48 sm:ml-0" />}>
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
    <div className="ml-auto flex items-center gap-2 sm:ml-0">
      {user && (
        <Link
          href="/inbox"
          className="relative rounded-md p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label={`Inbox, ${unread} unread`}
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-brass px-1 text-center text-[10px] font-bold leading-4 text-abyss">
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
