'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/contas', label: 'Contas' },
  { href: '/conexoes', label: 'Conexões' },
];

export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="fixed left-0 right-0 top-0 z-10 h-14 border-b border-border bg-surface shadow-card">
      <div className="flex h-full items-center gap-6 px-8">
        <Link href="/" className="text-xs font-black uppercase tracking-[0.12em] text-primary">
          Contas
        </Link>
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary-soft font-semibold text-primary'
                    : 'text-muted hover:bg-surface-muted hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }} />
        </div>
      </div>
    </header>
  );
}
