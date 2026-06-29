'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Share2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useMonth } from '@/lib/hooks/use-month';

function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function MesesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const year = parseInt(searchParams.get('year') ?? String(currentYear));
  const month = parseInt(searchParams.get('month') ?? String(currentMonth));
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const { data, isLoading, isError } = useMonth(year, month);

  function navigate(y: number, m: number) {
    if (m === currentMonth && y === currentYear) {
      router.push('/');
    } else {
      router.push(`/?year=${y}&month=${m}`);
    }
  }

  function prevMonth() {
    if (month === 1) navigate(year - 1, 12);
    else navigate(year, month - 1);
  }

  function nextMonth() {
    if (isCurrentMonth) return;
    if (month === 12) navigate(year + 1, 1);
    else navigate(year, month + 1);
  }

  const monthName = capitalize(
    new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
  );

  if (isLoading) return <PageSkeleton />;

  if (isError || !data) {
    return <div className="card p-6 text-center text-muted">Erro ao carregar as contas do mês.</div>;
  }

  const monthlyBills = data.monthlyBills;
  const personalBills = monthlyBills.filter((mb) => !mb.bill?.isShared);
  const sharedBills = monthlyBills.filter((mb) => mb.bill?.isShared);

  const totalAmount = monthlyBills.reduce((sum, mb) => sum + (mb.amount ?? 0), 0);
  const totalPaid = monthlyBills.filter((mb) => mb.paidAt).reduce((sum, mb) => sum + (mb.amount ?? 0), 0);
  const totalToPay = totalAmount - totalPaid;
  const paidCount = monthlyBills.filter((mb) => mb.paidAt).length;

  return (
    <div className="flex animate-[fade-in_0.35s_ease_both] flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronLeft size={16} />
          </button>

          <h1 className="page-title">{monthName}</h1>

          <button
            type="button"
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => navigate(currentYear, currentMonth)}
              className="ml-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary"
            >
              Mês atual
            </button>
          )}
        </div>

        <p className="text-sm text-muted">
          {paidCount} de {monthlyBills.length} contas pagas
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="section-title mb-1">Total do mês</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="card p-5">
          <p className="section-title mb-1">Pago</p>
          <p className="text-2xl font-bold text-positive">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card p-5">
          <p className="section-title mb-1">A pagar</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalToPay)}</p>
        </div>
      </div>

      {personalBills.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Minhas contas</h2>
          <div className="flex flex-col gap-2">
            {personalBills.map((mb) => (
              <div key={mb._id} className="card flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  {mb.paidAt ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-positive" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 text-muted" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{mb.bill?.name ?? '—'}</p>
                    {mb.bill?.where && <p className="text-xs text-muted">{mb.bill.where}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(mb.amount)}</p>
                  {mb.paidAt && <p className="text-xs text-positive">Pago</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sharedBills.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Contas compartilhadas</h2>
          <div className="flex flex-col gap-2">
            {sharedBills.map((mb) => (
              <div key={mb._id} className="card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{mb.bill?.name ?? '—'}</p>
                      {mb.bill?.where && <p className="text-xs text-muted">{mb.bill.where}</p>}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(mb.amount)}</p>
                </div>
                {mb.sharedData && (
                  <div className="mt-3 flex gap-4 rounded-xl bg-surface-muted px-4 py-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {mb.sharedData.otherPaidAt ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-positive" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted" />
                      )}
                      <span className="text-muted">
                        Parte deles: {formatCurrency(mb.sharedData.otherAmount)}
                      </span>
                    </div>
                    {mb.sharedData.payerConfirmedAt && (
                      <span className="text-positive">PIX confirmado</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {monthlyBills.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-muted">Nenhuma conta cadastrada ainda.</p>
          <p className="mt-1 text-sm text-muted">
            Acesse <strong>Contas</strong> no menu para adicionar suas contas mensais.
          </p>
        </div>
      )}
    </div>
  );
}

export default function MesesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MesesContent />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
