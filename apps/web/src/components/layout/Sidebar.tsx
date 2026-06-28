'use client';

import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/contas', label: 'Contas', Icon: ListChecks },
  { href: '/conexoes', label: 'Conexões', Icon: Share2 },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`flex h-full flex-col py-5 transition-all duration-200 ${collapsed ? 'px-2' : 'px-4'}`}
    >
      {/* Logo */}
      <div className={`mb-6 flex items-center ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expandir menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : (
          <>
            <Link
              href="/"
              onClick={onNavigate}
              className="flex flex-1 items-center gap-2.5"
              title="Dashboard"
            >
              <span className="text-lg font-bold tracking-tight text-foreground">Contas</span>
            </Link>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Recolher menu"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <PanelLeftClose size={15} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_LINKS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? label : undefined}
              className={`group relative flex items-center rounded-xl text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                active
                  ? 'bg-primary-soft text-primary'
                  : 'text-muted hover:bg-surface-muted hover:text-foreground'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                size={20}
                className={
                  active
                    ? 'shrink-0 text-primary'
                    : 'shrink-0 text-muted transition-colors group-hover:text-foreground'
                }
              />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`mt-4 flex items-center rounded-xl border border-border bg-surface-muted px-3 py-2 ${collapsed ? 'justify-center' : 'justify-between gap-2'}`}
      >
        <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }} />
      </div>
    </div>
  );
}
