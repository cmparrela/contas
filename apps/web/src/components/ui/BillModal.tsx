'use client';

import type { BillResponse, CreateBillInput, UpdateBillInput } from '@contas/shared';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCreateBill, useUpdateBill } from '@/lib/hooks/use-bills';
import { useConnections } from '@/lib/hooks/use-connections';

type ShareType = 'user' | 'external';

type FormData = {
  name: string;
  amount: string;
  where: string;
  notes: string;
  isShared: boolean;
  shareType: ShareType;
  sharedWithUserId: string;
  externalName: string;
  externalPhone: string;
  splitType: 'half' | 'custom';
  customSplitAmount: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  amount: '',
  where: '',
  notes: '',
  isShared: false,
  shareType: 'user',
  sharedWithUserId: '',
  externalName: '',
  externalPhone: '',
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
    shareType: b.externalContact ? 'external' : 'user',
    sharedWithUserId: b.sharedWithUserId ?? '',
    externalName: b.externalContact?.name ?? '',
    externalPhone: b.externalContact?.phone ?? '',
    splitType: b.splitType ?? 'half',
    customSplitAmount: b.customSplitAmount != null ? String(b.customSplitAmount) : '',
  };
}

interface BillModalProps {
  open: boolean;
  bill?: BillResponse;
  billCount?: number;
  onClose: () => void;
}

export function BillModal({ open, bill, billCount = 0, onClose }: BillModalProps) {
  const { data: connectionsData } = useConnections();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    if (open) setForm(bill ? billToForm(bill) : EMPTY_FORM);
  }, [open, bill]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const acceptedConnections = connectionsData?.accepted ?? [];
  const isPending = createBill.isPending || updateBill.isPending;

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const isExternal = form.isShared && form.shareType === 'external';
    const isUser = form.isShared && form.shareType === 'user';

    const payload = {
      name: form.name.trim(),
      amount: form.amount ? Number(form.amount) : undefined,
      where: form.where.trim() || undefined,
      notes: form.notes.trim() || undefined,
      isShared: form.isShared,
      sharedWithUserId: isUser && form.sharedWithUserId ? form.sharedWithUserId : undefined,
      externalContact:
        isExternal && form.externalName.trim()
          ? { name: form.externalName.trim(), phone: form.externalPhone.trim() || undefined }
          : undefined,
      splitType: form.isShared ? form.splitType : undefined,
      customSplitAmount:
        form.isShared && form.splitType === 'custom' && form.customSplitAmount
          ? Number(form.customSplitAmount)
          : undefined,
    };

    if (bill) {
      await updateBill.mutateAsync({ id: bill._id, body: payload as UpdateBillInput });
    } else {
      await createBill.mutateAsync({ ...payload, order: billCount } as CreateBillInput);
    }

    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {bill ? 'Editar conta' : 'Nova conta'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="bill-name" className="text-xs font-medium text-muted">
                Nome *
              </label>
              <input
                id="bill-name"
                className="input"
                placeholder="Ex: Internet, Plano saúde Mãe"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bill-amount" className="text-xs font-medium text-muted">
                Valor (R$)
              </label>
              <input
                id="bill-amount"
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
              <label htmlFor="bill-where" className="text-xs font-medium text-muted">
                Onde pagar
              </label>
              <input
                id="bill-where"
                className="input"
                placeholder="App Claro, Site Copel, Boleto email…"
                value={form.where}
                onChange={(e) => setField('where', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="bill-notes" className="text-xs font-medium text-muted">
                Observações
              </label>
              <input
                id="bill-notes"
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
              {/* Toggle: usuário do sistema vs contato externo */}
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setField('shareType', 'user')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                    form.shareType === 'user'
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Usuário do sistema
                </button>
                <button
                  type="button"
                  onClick={() => setField('shareType', 'external')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                    form.shareType === 'external'
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Contato externo
                </button>
              </div>

              {form.shareType === 'user' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bill-shared-with" className="text-xs font-medium text-muted">
                    Com quem?
                  </label>
                  {acceptedConnections.length === 0 ? (
                    <p className="text-xs text-warning">
                      Você ainda não tem conexões. Adicione alguém em{' '}
                      <a href="/conexoes" className="underline">
                        Conexões
                      </a>
                      .
                    </p>
                  ) : (
                    <select
                      id="bill-shared-with"
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
              )}

              {form.shareType === 'external' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="bill-ext-name" className="text-xs font-medium text-muted">
                      Nome *
                    </label>
                    <input
                      id="bill-ext-name"
                      className="input"
                      placeholder="Ex: Irmão, Mãe, João"
                      value={form.externalName}
                      onChange={(e) => setField('externalName', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="bill-ext-phone" className="text-xs font-medium text-muted">
                      Telefone (WhatsApp)
                    </label>
                    <input
                      id="bill-ext-phone"
                      className="input"
                      placeholder="Ex: 11999999999"
                      value={form.externalPhone}
                      onChange={(e) => setField('externalPhone', e.target.value)}
                    />
                    <p className="text-xs text-muted">
                      Com telefone, você poderá abrir o WhatsApp direto para enviar a mensagem.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted">Como dividir?</p>
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
                  <label htmlFor="bill-custom-split" className="text-xs font-medium text-muted">
                    Valor da parte deles (R$)
                  </label>
                  <input
                    id="bill-custom-split"
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
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || !form.name.trim()} className="btn-primary">
              {isPending ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
