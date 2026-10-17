'use client';
import Link, { useLinkStatus } from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FileText, Loader2, Newspaper, Ship, type LucideIcon } from 'lucide-react';

// Pitch build: every item opens the Inventory. The tab param only decides which item is highlighted.
const NAV = [
  { tab: null, href: '/fleet', label: 'Inventory', icon: Ship },
  { tab: 'advisor', href: '/fleet?tab=advisor', label: 'Advisor', icon: FileText },
  { tab: 'events', href: '/fleet?tab=events', label: 'Event Feed', icon: Newspaper },
];

export function NavLinks() {
  const pathname = usePathname();
  const tab = useSearchParams().get('tab');
  const inInventory = pathname === '/fleet' || pathname.startsWith('/vessel');
  const fromUrl = inInventory ? (NAV.find((n) => n.tab === tab) ?? NAV[0]).label : null;

  // Highlight the clicked item immediately, before the navigation finishes.
  const [clicked, setClicked] = useState<{ label: string; from: string | null } | null>(null);
  const current = clicked && clicked.from === fromUrl ? clicked.label : fromUrl;

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto text-sm">
      {NAV.map(({ href, label, icon }) => {
        const active = current === label;
        return (
          <Link
            key={label}
            href={href}
            scroll
            onClick={() => setClicked({ label, from: fromUrl })}
            aria-current={active ? 'page' : undefined}
            className={`relative flex shrink-0 select-none items-center gap-1.5 rounded-md px-3 py-1.5 transition duration-150 active:scale-95 ${
              active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <NavItemBody icon={icon} label={label} active={active} />
          </Link>
        );
      })}
    </nav>
  );
}

function NavItemBody({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brass" aria-hidden />
      ) : (
        <Icon className={`h-3.5 w-3.5 transition-colors ${active ? 'text-brass' : ''}`} aria-hidden />
      )}
      {label}
      <span
        className={`absolute inset-x-2 -bottom-[3px] h-0.5 rounded-full bg-brass transition-all duration-200 ${active ? 'opacity-100' : 'scale-x-0 opacity-0'}`}
        aria-hidden
      />
    </>
  );
}
