'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Newspaper, Ship } from 'lucide-react';

const NAV = [
  { href: '/fleet', label: 'Inventory', icon: Ship },
  // Pitch build: Advisor and Event Feed open the Inventory too.
  { href: '/fleet', label: 'Advisor', icon: FileText },
  { href: '/fleet', label: 'Event Feed', icon: Newspaper },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-0.5 overflow-x-auto text-sm">
      {NAV.map(({ href, label, icon: Icon }, i) => {
        const active = i === 0 && (pathname === href || pathname.startsWith(`${href}/`) || (href === '/fleet' && pathname.startsWith('/vessel')));
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
              active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${active ? 'text-brass' : ''}`} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
