'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

interface SortableBillRowProps {
  id: string;
  className: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children: (dragHandle: ReactNode) => ReactNode;
}

/** Wraps a bill row with dnd-kit sortable behavior, exposing a drag handle via render prop
 *  so the row keeps its own click-to-edit and action-button markup untouched. */
export function SortableBillRow({ id, className, onClick, children }: SortableBillRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const dragHandle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      className="flex h-6 w-6 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted/40 hover:text-muted active:cursor-grabbing"
      aria-label="Arrastar para reordenar"
    >
      <GripVertical size={14} />
    </button>
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: whole-row click is a shortcut; the row always renders its own focusable "Editar" button for keyboard users
    // biome-ignore lint/a11y/useKeyWithClickEvents: same as above — keyboard access goes through the row's "Editar" button, not this wrapper
    <div ref={setNodeRef} style={style} className={className} onClick={onClick}>
      {children(dragHandle)}
    </div>
  );
}
