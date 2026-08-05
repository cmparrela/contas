'use client';

import type { TagResponse } from '@contas/shared';
import { Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TagFormModal } from '@/components/ui/TagFormModal';
import { useDeleteTag, useTags } from '@/lib/hooks/use-tags';

export default function TagsPage() {
  const { data: tags, isLoading } = useTags();
  const deleteTag = useDeleteTag();

  const [formTag, setFormTag] = useState<TagResponse | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagResponse | undefined>(undefined);

  function openCreate() {
    setFormTag(undefined);
    setShowForm(true);
  }

  function openEdit(tag: TagResponse) {
    setFormTag(tag);
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tags</h1>
          <p className="text-sm text-muted">Organize suas contas com tags e cores.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Nova tag
        </button>
      </header>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && (tags?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2">
          {tags?.map((tag) => (
            <div key={tag._id} className="card flex items-center gap-4 px-4 py-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${tag.color}1A` }}
              >
                <TagIcon size={16} style={{ color: tag.color }} />
              </div>
              <p className="flex-1 text-sm font-medium text-foreground">{tag.name}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(tag)}
                  className="btn-ghost gap-1.5 px-3 py-2 text-xs"
                >
                  <Pencil size={13} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingTag(tag)}
                  className="btn-ghost gap-1.5 px-3 py-2 text-xs text-danger"
                >
                  <Trash2 size={13} />
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (tags?.length ?? 0) === 0 && (
        <div className="card p-10 text-center">
          <p className="text-muted">Nenhuma tag ainda.</p>
          <p className="mt-1 text-sm text-muted">Crie tags para organizar suas contas.</p>
          <button type="button" onClick={openCreate} className="btn-primary mt-4">
            <Plus size={16} />
            Nova tag
          </button>
        </div>
      )}

      <TagFormModal open={showForm} tag={formTag} onClose={() => setShowForm(false)} />

      {deletingTag && (
        <ConfirmDialog
          message={`Apagar a tag "${deletingTag.name}"? Ela será removida de todas as contas que a usam.`}
          confirmLabel="Apagar"
          isLoading={deleteTag.isPending}
          onConfirm={async () => {
            if (deleteTag.isPending) return;
            await deleteTag.mutateAsync(deletingTag._id);
            setDeletingTag(undefined);
          }}
          onCancel={() => setDeletingTag(undefined)}
        />
      )}
    </div>
  );
}
