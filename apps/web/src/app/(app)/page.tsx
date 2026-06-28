'use client';

import { CheckCircle2, Circle, Share2 } from 'lucide-react';
import { useMonth } from '@/lib/hooks/use-month';

function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function DashboardPage() {
  const { year, month } = getCurrentYearMonth();
  const { data, isLoading, isError } = useMonth(year, month);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="card p-6 text-center text-muted">
        Erro ao carregar as contas do mês.
      </div>
    );
  }

  const monthlyBills = data.monthlyBills;
  const personalBills = monthlyBills.filter((mb) => !mb.bill?.isShared);
  const sharedBills = monthlyBills.filter((mb) => mb.bill?.isShared);

  const totalAmount = monthlyBills.reduce((sum, mb) => sum + (mb.amount ?? 0), 0);
  const totalPaid = monthlyBills
    .filter((mb) => mb.paidAt)
    .reduce((sum, mb) => sum + (mb.amount ?? 0), 0);
  const totalToPay = totalAmount - totalPaid;

  const monthName = new Date(year, month - 1).toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex animate-[fade-in_0.35s_ease_both] flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="page-title">
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </h1>
        <p className="text-sm text-muted">Contas do mês e status de pagamento.</p>
      </header>

      {/* Summary */}
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

      {/* Personal bills */}
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
                    {mb.bill?.where && (
                      <p className="text-xs text-muted">{mb.bill.where}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(mb.amount)}
                  </p>
                  {mb.paidAt && (
                    <p className="text-xs text-positive">Pago</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shared bills */}
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
                      {mb.bill?.where && (
                        <p className="text-xs text-muted">{mb.bill.where}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(mb.amount)}
                  </p>
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

function DashboardSkeleton() {
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
