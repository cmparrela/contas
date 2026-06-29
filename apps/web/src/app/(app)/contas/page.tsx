'use client';

import type { BillResponse, ConnectionResponse, MonthlyBillResponse } from '@contas/shared';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCopy,
  MessageSquare,
  Pencil,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { BillModal } from '@/components/ui/BillModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { capitalize, formatCurrency } from '@/lib/format';
import { useBills, useDeleteBill } from '@/lib/hooks/use-bills';
import { useConnections } from '@/lib/hooks/use-connections';
import { useMonth, useUpdateMonthlyBill } from '@/lib/hooks/use-month';

const PIX_KEY_STORAGE = 'contas:pixKey';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildSingleMessage(mb: MonthlyBillResponse, pixKey: string): string {
  const name = mb.bill?.name ?? 'Conta';
  const total = mb.amount ?? 0;
  const otherAmount =
    mb.sharedData?.otherAmount ?? (mb.bill?.splitType === 'half' ? total / 2 : null);
  const perPerson = otherAmount ?? total / 2;

  const lines = [`*${name}*`, `Total: ${fmt(total)} ÷ 2 pessoas = *${fmt(perPerson)} cada*`];
  if (pixKey.trim()) lines.push(`\nPIX: \`${pixKey.trim()}\``);
  return lines.join('\n');
}

function buildGroupedMessage(
  mbs: MonthlyBillResponse[],
  pixKey: string,
  monthLabel: string,
): string {
  const lines: string[] = [`*Contas compartilhadas — ${monthLabel}*\n`];

  let totalOther = 0;
  for (const mb of mbs) {
    const name = mb.bill?.name ?? 'Conta';
    const total = mb.amount ?? 0;
    const otherAmount =
      mb.sharedData?.otherAmount ?? (mb.bill?.splitType === 'half' ? total / 2 : total / 2);
    totalOther += otherAmount;

    if (mb.bill?.splitType === 'custom' || mb.sharedData?.otherAmount != null) {
      lines.push(`*${name}*\nTotal: ${fmt(total)} → sua parte: *${fmt(otherAmount)}*`);
    } else {
      lines.push(`*${name}*\nTotal: ${fmt(total)} ÷ 2 = *${fmt(otherAmount)} cada*`);
    }
  }

  lines.push(`\n─────────────────`);
  lines.push(`Total a pagar: *${fmt(totalOther)}*`);
  if (pixKey.trim()) lines.push(`PIX: \`${pixKey.trim()}\``);
  return lines.join('\n');
}

function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// ─── Buttons ────────────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  if (label) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-primary hover:text-primary"
      >
        {copied ? <Check size={11} className="text-positive" /> : <ClipboardCopy size={11} />}
        {copied ? 'Copiado!' : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-primary"
      aria-label="Copiar mensagem"
      title="Copiar mensagem"
    >
      {copied ? <Check size={13} className="text-positive" /> : <ClipboardCopy size={13} />}
    </button>
  );
}

function WhatsAppButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-[#25D366] hover:text-[#25D366]"
      title="Abrir no WhatsApp"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      WhatsApp
    </a>
  );
}

function NotesPopover({ notes }: { notes: string }) {
  return (
    <div className="group/note relative flex-shrink-0">
      <MessageSquare size={12} className="text-muted/60 cursor-default" />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted shadow-float opacity-0 transition-opacity group-hover/note:opacity-100">
        {notes}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
      </div>
    </div>
  );
}

function PixKeyBanner({ pixKey, onChange }: { pixKey: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pixKey);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function save() {
    onChange(draft.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="mb-3 flex items-center gap-2">
        <input
          ref={inputRef}
          className="input flex-1 text-xs"
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
        <button type="button" onClick={save} className="btn-primary py-1 text-xs">
          Salvar
        </button>
        <button type="button" onClick={() => setEditing(false)} className="btn-ghost py-1 text-xs">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="section-title">Contas compartilhadas</h2>
      <button
        type="button"
        onClick={() => {
          setDraft(pixKey);
          setEditing(true);
        }}
        className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-primary hover:text-primary"
        title={pixKey ? 'Editar chave PIX' : 'Adicionar chave PIX para mensagens de cobrança'}
      >
        {pixKey ? (
          <>
            <span className="font-medium text-foreground">PIX:</span>
            <span className="max-w-32 truncate">{pixKey}</span>
            <Pencil size={11} />
          </>
        ) : (
          <>
            <Plus size={11} />
            Chave PIX
          </>
        )}
      </button>
    </div>
  );
}

interface SharedGroup {
  key: string;
  label: string;
  phone?: string;
  bills: MonthlyBillResponse[];
}

function buildSharedGroups(
  sharedBills: MonthlyBillResponse[],
  connections: ConnectionResponse[],
): SharedGroup[] {
  const groups = new Map<string, SharedGroup>();

  for (const mb of sharedBills) {
    const bill = mb.bill;
    if (!bill) continue;

    let key: string;
    let label: string;
    let phone: string | undefined;

    if (bill.externalContact) {
      key = `ext:${bill.externalContact.name}`;
      label = bill.externalContact.name;
      phone = bill.externalContact.phone;
    } else if (bill.sharedWithUserId) {
      key = `user:${bill.sharedWithUserId}`;
      const conn = connections.find((c) => c.toUserId === bill.sharedWithUserId);
      label = conn?.toEmail ?? bill.sharedWithUserId;
    } else {
      key = 'unknown';
      label = 'Desconhecido';
    }

    const existing = groups.get(key);
    if (existing) {
      existing.bills.push(mb);
    } else {
      groups.set(key, { key, label, phone, bills: [mb] });
    }
  }

  return Array.from(groups.values());
}

function ContasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const year = parseInt(searchParams.get('year') ?? String(currentYear), 10);
  const month = parseInt(searchParams.get('month') ?? String(currentMonth), 10);
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const { data, isLoading, isError } = useMonth(year, month);
  const { data: billsData } = useBills();
  const { data: connectionsData } = useConnections();
  const updateMonthlyBill = useUpdateMonthlyBill(year, month);
  const deleteBill = useDeleteBill();

  const [modalState, setModalState] = useState<{ open: boolean; bill?: BillResponse }>({
    open: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<BillResponse | null>(null);
  const [pixKey, setPixKey] = useState('');

  useEffect(() => {
    setPixKey(localStorage.getItem(PIX_KEY_STORAGE) ?? '');
  }, []);

  function savePixKey(v: string) {
    setPixKey(v);
    localStorage.setItem(PIX_KEY_STORAGE, v);
  }

  function navigate(y: number, m: number) {
    if (m === currentMonth && y === currentYear) {
      router.push('/contas');
    } else {
      router.push(`/contas?year=${y}&month=${m}`);
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
    return (
      <div className="card p-6 text-center text-muted">Erro ao carregar as contas do mês.</div>
    );
  }

  const monthlyBills = data.monthlyBills.filter((mb) => mb.bill != null);
  const personalBills = monthlyBills.filter((mb) => !mb.bill?.isShared);
  const sharedBills = monthlyBills.filter((mb) => mb.bill?.isShared);
  const sharedGroups = buildSharedGroups(sharedBills, connectionsData?.accepted ?? []);

  const totalAmount = monthlyBills.reduce((sum, mb) => sum + (mb.amount ?? 0), 0);
  const { totalPaid, paidCount } = monthlyBills.reduce(
    (acc, mb) => {
      if (mb.paidAt) {
        acc.totalPaid += mb.amount ?? 0;
        acc.paidCount += 1;
      }
      return acc;
    },
    { totalPaid: 0, paidCount: 0 },
  );
  const totalToPay = totalAmount - totalPaid;

  function togglePaid(billId: string, currentlyPaid: boolean) {
    updateMonthlyBill.mutate({ billId, body: { paid: !currentlyPaid } });
  }

  return (
    <>
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

            <button
              type="button"
              onClick={() => setModalState({ open: true })}
              className="btn-primary ml-auto"
            >
              <Plus size={16} />
              Nova conta
            </button>
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
                <div
                  key={mb._id}
                  className="group card flex cursor-pointer items-center justify-between gap-4 p-4"
                  onClick={() => mb.bill && setModalState({ open: true, bill: mb.bill })}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePaid(mb.billId, !!mb.paidAt);
                      }}
                      className="flex-shrink-0 rounded-full transition-opacity hover:opacity-70"
                      aria-label={mb.paidAt ? 'Desmarcar como pago' : 'Marcar como pago'}
                    >
                      {mb.paidAt ? (
                        <CheckCircle2 className="h-5 w-5 text-positive" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">
                          {mb.bill?.name ?? '—'}
                        </p>
                        {mb.bill?.notes && <NotesPopover notes={mb.bill.notes} />}
                      </div>
                      {mb.bill?.where && <p className="text-xs text-muted">{mb.bill.where}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(mb.amount)}
                      </p>
                      {mb.paidAt && <p className="text-xs text-positive">Pago</p>}
                    </div>
                    {mb.bill && (
                      <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalState({ open: true, bill: mb.bill });
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
                          aria-label="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            mb.bill && setDeleteTarget(mb.bill);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                          aria-label="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sharedGroups.length > 0 && (
          <section>
            <PixKeyBanner pixKey={pixKey} onChange={savePixKey} />
            <div className="flex flex-col gap-6">
              {sharedGroups.map((group) => {
                const groupedMsg = buildGroupedMessage(group.bills, pixKey, monthName);
                const waUrl = group.phone ? buildWhatsAppUrl(group.phone, groupedMsg) : undefined;

                return (
                  <div key={group.key}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{group.label}</span>
                      <div
                        className="ml-auto flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {group.bills.length > 1 && (
                          <CopyButton text={groupedMsg} label="Copiar tudo" />
                        )}
                        {waUrl && <WhatsAppButton url={waUrl} />}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {group.bills.map((mb) => (
                        <div
                          key={mb._id}
                          className="group card cursor-pointer p-4"
                          onClick={() => mb.bill && setModalState({ open: true, bill: mb.bill })}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePaid(mb.billId, !!mb.paidAt);
                                }}
                                className="flex-shrink-0 rounded-full transition-opacity hover:opacity-70"
                                aria-label={mb.paidAt ? 'Desmarcar como pago' : 'Marcar como pago'}
                              >
                                {mb.paidAt ? (
                                  <CheckCircle2 className="h-5 w-5 text-positive" />
                                ) : (
                                  <Share2 className="h-5 w-5 text-primary" />
                                )}
                              </button>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium text-foreground">
                                    {mb.bill?.name ?? '—'}
                                  </p>
                                  {mb.bill?.notes && <NotesPopover notes={mb.bill.notes} />}
                                </div>
                                {mb.bill?.where && (
                                  <p className="text-xs text-muted">{mb.bill.where}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {formatCurrency(mb.amount)}
                              </p>
                              {mb.bill && (
                                <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <CopyButton text={buildSingleMessage(mb, pixKey)} />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalState({ open: true, bill: mb.bill });
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
                                    aria-label="Editar"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      mb.bill && setDeleteTarget(mb.bill);
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                                    aria-label="Remover"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
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
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {monthlyBills.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-muted">Nenhuma conta cadastrada ainda.</p>
            <button
              type="button"
              onClick={() => setModalState({ open: true })}
              className="btn-primary mt-4"
            >
              <Plus size={16} />
              Adicionar primeira conta
            </button>
          </div>
        )}
      </div>

      <BillModal
        open={modalState.open}
        bill={modalState.bill}
        billCount={billsData?.length ?? 0}
        onClose={() => setModalState({ open: false })}
      />

      {deleteTarget && (
        <ConfirmDialog
          message={`Remover "${deleteTarget.name}"? Isso afeta todos os meses.`}
          confirmLabel="Remover"
          onConfirm={async () => {
            await deleteBill.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

export default function ContasPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContasContent />
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
