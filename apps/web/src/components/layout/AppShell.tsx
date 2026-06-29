'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile topbar */}
      <div className="fixed left-0 right-0 top-0 z-20 flex h-12 items-center border-b border-border bg-surface px-4 md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
        >
          <Menu size={18} />
        </button>
        <span className="ml-3 text-xs font-black uppercase tracking-[0.12em] text-primary">
          Contas
        </span>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen pt-12 md:ml-48 md:pt-0">
        <div className="mx-auto max-w-2xl px-6 py-8 md:px-10 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
