export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-[440px] flex-shrink-0 flex-col justify-between bg-[#0f0e2a] p-12 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(83,77,238,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(12,186,121,0.2) 0%, transparent 55%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-3xl font-bold tracking-tight text-white">Contas</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Suas contas do lar,{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #818cf8, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              organizadas.
            </span>
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-sm">
            Cadastre as contas mensais, marque as pagas e divida facilmente com quem mora com você.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} Contas. Feito para o lar.
        </p>
      </div>

      {/* Form area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-background">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="text-xl font-bold tracking-tight text-foreground">Contas</span>
        </div>
        {children}
      </div>
    </div>
  );
}
