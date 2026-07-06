export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="relative hidden flex-shrink-0 flex-col justify-between overflow-hidden bg-brand p-12 lg:flex lg:w-[440px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(255,255,255,0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(0,0,0,0.18) 0%, transparent 55%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
            Conta Certa
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Suas contas do lar, organizadas.
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-white/70">
            Cadastre as contas mensais, marque as pagas e divida facilmente com quem mora com você.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Conta Certa. Feito para o lar.
        </p>
      </div>

      {/* Form area */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% -10%, var(--color-primary-glow) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-primary">
            Conta Certa
          </span>
        </div>
        <div className="relative z-10 flex w-full flex-col items-center">{children}</div>
      </div>
    </div>
  );
}
