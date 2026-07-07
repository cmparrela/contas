'use client';

import type { TagResponse } from '@contas/shared';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TAG_COLORS } from '@/lib/constants/tag-colors';
import { useCreateTag, useUpdateTag } from '@/lib/hooks/use-tags';

interface TagFormModalProps {
  open: boolean;
  tag?: TagResponse;
  onClose: () => void;
}

export function TagFormModal({ open, tag, onClose }: TagFormModalProps) {
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(TAG_COLORS[0]);

  useEffect(() => {
    if (open) {
      setName(tag?.name ?? '');
      setColor(tag?.color ?? TAG_COLORS[0]);
    }
  }, [open, tag]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const isPending = createTag.isPending || updateTag.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (tag) {
      await updateTag.mutateAsync({ id: tag._id, body: { name: name.trim(), color } });
    } else {
      await createTag.mutateAsync({ name: name.trim(), color });
    }

    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-sm p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {tag ? 'Editar tag' : 'Nova tag'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tag-name" className="text-xs font-medium text-muted">
              Nome *
            </label>
            <input
              id="tag-name"
              className="input"
              placeholder="Ex: Casa, Assinatura, Cartão"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Cor</span>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  aria-label={swatch}
                  className="h-7 w-7 rounded-full ring-offset-2 ring-offset-surface transition-shadow"
                  style={{
                    backgroundColor: swatch,
                    boxShadow: color === swatch ? `0 0 0 2px ${swatch}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || !name.trim()} className="btn-primary">
              {isPending ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
