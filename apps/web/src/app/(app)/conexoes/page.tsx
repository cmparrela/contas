'use client';

import { Check, Mail, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import {
  useAcceptConnection,
  useConnections,
  useInviteConnection,
  useRejectConnection,
} from '@/lib/hooks/use-connections';

export default function ConexoesPage() {
  const { data, isLoading } = useConnections();
  const inviteConnection = useInviteConnection();
  const acceptConnection = useAcceptConnection();
  const rejectConnection = useRejectConnection();

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const accepted = data?.accepted ?? [];
  const pending = data?.pending ?? [];
  const sent = data?.sent ?? [];

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    try {
      await inviteConnection.mutateAsync({ email: email.trim() });
      setEmail('');
      setInviteError('');
      setShowForm(false);
    } catch {
      setInviteError('Usuário não encontrado. Peça para ele criar a conta primeiro.');
    }
  }

  function cancelForm() {
    setShowForm(false);
    setEmail('');
    setInviteError('');
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Conexões</h1>
          <p className="text-sm text-muted">Pessoas com quem você divide contas.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
            <Mail size={16} />
            Convidar
          </button>
        )}
      </header>

      {showForm && (
        <form onSubmit={handleInvite} className="card flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Convidar por e-mail</h2>
            <button
              type="button"
              onClick={cancelForm}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-xs font-medium text-muted">
              E-mail
            </label>
            <input
              id="invite-email"
              className="input"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {inviteError && <p className="text-xs text-danger">{inviteError}</p>}
          </div>

          <p className="text-xs text-muted">
            A pessoa precisa ter uma conta no app antes de ser convidada.
          </p>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={cancelForm} className="btn-ghost">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={inviteConnection.isPending || !email.trim()}
              className="btn-primary"
            >
              {inviteConnection.isPending ? 'Enviando…' : 'Enviar convite'}
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="section-title">Convites recebidos</h2>
          <div className="flex flex-col gap-2">
            {pending.map((c) => (
              <div key={c._id} className="card flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                    <Mail size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.fromEmail}</p>
                    <p className="text-xs text-muted">quer se conectar com você</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => rejectConnection.mutate(c._id)}
                    disabled={rejectConnection.isPending}
                    className="btn-ghost gap-1.5 px-3 py-2 text-xs"
                  >
                    <X size={13} />
                    Recusar
                  </button>
                  <button
                    type="button"
                    onClick={() => acceptConnection.mutate(c._id)}
                    disabled={acceptConnection.isPending}
                    className="btn-primary gap-1.5 px-3 py-2 text-xs"
                  >
                    <Check size={13} />
                    Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {accepted.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="section-title">Suas conexões</h2>
          <div className="flex flex-col gap-2">
            {accepted.map((c) => (
              <div key={c._id} className="card flex items-center gap-4 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-positive-soft">
                  <UserCheck size={16} className="text-positive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {c.fromEmail === c.toEmail ? c.toEmail : `${c.fromEmail} ↔ ${c.toEmail}`}
                  </p>
                  <p className="text-xs text-positive">Conectado</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="section-title">Convites enviados</h2>
          <div className="flex flex-col gap-2">
            {sent.map((c) => (
              <div key={c._id} className="card flex items-center gap-4 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted">
                  <Mail size={16} className="text-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.toEmail}</p>
                  <p className="text-xs text-muted">Aguardando resposta</p>
                </div>
                <span className="badge bg-warning-soft text-warning">pendente</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading &&
        accepted.length === 0 &&
        pending.length === 0 &&
        sent.length === 0 &&
        !showForm && (
          <div className="card p-10 text-center">
            <p className="text-muted">Nenhuma conexão ainda.</p>
            <p className="mt-1 text-sm text-muted">Convide alguém para dividir contas juntos.</p>
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary mt-4">
              <Mail size={16} />
              Convidar alguém
            </button>
          </div>
        )}
    </div>
  );
}
