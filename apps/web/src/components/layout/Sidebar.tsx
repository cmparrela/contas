'use client';

import { UserButton } from '@clerk/nextjs';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Meses' },
  { href: '/contas', label: 'Contas' },
  { href: '/conexoes', label: 'Conexões' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-30 flex w-48 flex-col border-r border-border bg-surface shadow-card transition-transform duration-200 md:z-10 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex flex-1 flex-col gap-1 px-3 py-5">
        <div className="mb-4 flex items-center justify-between px-2">
          <Link
            href="/"
            onClick={onClose}
            className="text-xs font-black uppercase tracking-[0.12em] text-primary"
          >
            Contas
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-foreground md:hidden"
          >
            <X size={14} />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
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
      </div>

      <div className="border-t border-border px-4 py-4">
        <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }} />
      </div>
    </aside>
  );
}
