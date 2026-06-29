'use client';

import type { BillResponse, CreateBillInput, UpdateBillInput } from '@contas/shared';
import { Pencil, Plus, Share2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/format';
import { useConnections } from '@/lib/hooks/use-connections';
import { useBills, useCreateBill, useDeleteBill, useUpdateBill } from '@/lib/hooks/use-bills';

type FormData = {
  name: string;
  amount: string;
  where: string;
  notes: string;
  isShared: boolean;
  sharedWithUserId: string;
  splitType: 'half' | 'custom';
  customSplitAmount: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  amount: '',
  where: '',
  notes: '',
  isShared: false,
  sharedWithUserId: '',
  splitType: 'half',
  customSplitAmount: '',
};

function billToForm(b: BillResponse): FormData {
  return {
    name: b.name,
    amount: b.amount != null ? String(b.amount) : '',
    where: b.where ?? '',
    notes: b.notes ?? '',
    isShared: b.isShared,
    sharedWithUserId: b.sharedWithUserId ?? '',
    splitType: b.splitType ?? 'half',
    customSplitAmount: b.customSplitAmount != null ? String(b.customSplitAmount) : '',
  };
}

export default function ContasPage() {
  const { data, isLoading } = useBills();
  const { data: connectionsData } = useConnections();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();
  const deleteBill = useDeleteBill();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const acceptedConnections = connectionsData?.accepted ?? [];
  const bills = data ?? [];

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(bill: BillResponse) {
    setForm(billToForm(bill));
    setEditingId(bill._id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      amount: form.amount ? Number(form.amount) : undefined,
      where: form.where.trim() || undefined,
      notes: form.notes.trim() || undefined,
      isShared: form.isShared,
      sharedWithUserId: form.isShared && form.sharedWithUserId ? form.sharedWithUserId : undefined,
      splitType: form.isShared ? form.splitType : undefined,
      customSplitAmount:
        form.isShared && form.splitType === 'custom' && form.customSplitAmount
          ? Number(form.customSplitAmount)
          : undefined,
    };

    if (editingId) {
      await updateBill.mutateAsync({ id: editingId, body: payload as UpdateBillInput });
    } else {
      await createBill.mutateAsync({ ...payload, order: bills.length } as CreateBillInput);
    }

    closeForm();
  }

  function handleDelete(id: string, name: string) {
    setConfirmDelete({ id, name });
  }

  async function executeDelete() {
    if (!confirmDelete) return;
    await deleteBill.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  }

  const isPending = createBill.isPending || updateBill.isPending;

  return (
    <div className="flex flex-col gap-8">
      {confirmDelete && (
        <ConfirmDialog
          message={`Remover "${confirmDelete.name}"?`}
          confirmLabel="Remover"
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Contas</h1>
          <p className="text-sm text-muted">Suas contas mensais recorrentes.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={openNew} className="btn-primary">
            <Plus size={16} />
            Nova conta
          </button>
        )}
      </header>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="card flex flex-col gap-4 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {editingId ? 'Editar conta' : 'Nova conta'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted">Nome *</label>
              <input
                className="input"
                placeholder="Ex: Internet, Plano saúde Mãe"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Valor (R$)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Vazio = variável"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Onde pagar</label>
              <input
                className="input"
                placeholder="App Claro, Site Copel, Boleto email…"
                value={form.where}
                onChange={(e) => setField('where', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted">Observações</label>
              <input
                className="input"
                placeholder="Agência 2141, vence dia 10…"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
              checked={form.isShared}
              onChange={(e) => setField('isShared', e.target.checked)}
            />
            <span className="text-sm font-medium text-foreground">Dividir com alguém</span>
          </label>

          {form.isShared && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-muted p-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Com quem?</label>
                {acceptedConnections.length === 0 ? (
                  <p className="text-xs text-warning">
                    Você ainda não tem conexões. Adicione alguém em{' '}
                    <a href="/conexoes" className="underline">Conexões</a>.
                  </p>
                ) : (
                  <select
                    className="input"
                    value={form.sharedWithUserId}
                    onChange={(e) => setField('sharedWithUserId', e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {acceptedConnections.map((c) => (
                      <option key={c._id} value={c.toUserId}>
                        {c.toEmail}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted">Como dividir?</label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="splitType"
                      value="half"
                      checked={form.splitType === 'half'}
                      onChange={() => setField('splitType', 'half')}
                      className="accent-primary"
                    />
                    Metade cada
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="splitType"
                      value="custom"
                      checked={form.splitType === 'custom'}
                      onChange={() => setField('splitType', 'custom')}
                      className="accent-primary"
                    />
                    Valor personalizado
                  </label>
                </div>
              </div>

              {form.splitType === 'custom' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Valor da parte deles (R$)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.customSplitAmount}
                    onChange={(e) => setField('customSplitAmount', e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || !form.name.trim()} className="btn-primary">
              {isPending ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && bills.length === 0 && !showForm && (
        <div className="card p-10 text-center">
          <p className="text-muted">Nenhuma conta cadastrada ainda.</p>
          <button type="button" onClick={openNew} className="btn-primary mt-4">
            <Plus size={16} />
            Adicionar primeira conta
          </button>
        </div>
      )}

      {bills.length > 0 && (
        <div className="flex flex-col gap-2">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="card flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{bill.name}</span>
                  {bill.isShared && (
                    <span className="badge bg-primary-soft text-primary">
                      <Share2 size={10} className="mr-1" />
                      dividida
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {bill.where && (
                    <span className="text-xs text-muted">{bill.where}</span>
                  )}
                  {bill.notes && (
                    <span className="text-xs text-muted">· {bill.notes}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(bill.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(bill)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
                  aria-label="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(bill._id, bill.name)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                  aria-label="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
