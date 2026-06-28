'use client';

import { Topbar } from './Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="mx-auto max-w-3xl px-8 pt-20 pb-12">
        {children}
      </main>
    </div>
  );
}
