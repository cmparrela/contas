import { ptBR } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Contas — Gestão de contas do lar',
  description: 'Organize as contas mensais da sua casa e divida com quem você mora.',
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--color-primary)',
    colorBackground: 'var(--color-surface)',
    colorInputBackground: 'var(--color-surface-muted)',
    colorInputText: 'var(--color-text)',
    colorText: 'var(--color-text)',
    colorTextSecondary: 'var(--color-text-muted)',
    colorDanger: 'var(--color-danger)',
    borderRadius: '12px',
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    fontSize: '15px',
  },
  elements: {
    card: 'shadow-float border border-border rounded-2xl',
    formButtonPrimary:
      'bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-colors',
    formFieldInput:
      'border border-border rounded-xl bg-surface-muted focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:border-primary transition',
    footerActionLink: 'text-primary hover:text-primary-hover font-medium',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR} appearance={clerkAppearance}>
      <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
        <head>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static theme-init script that runs before hydration to prevent FOUC */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="bg-background font-sans text-foreground">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
