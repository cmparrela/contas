interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel = 'Confirmar',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card flex w-full max-w-sm flex-col gap-5 p-6">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={isLoading} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className="btn-danger">
            {isLoading ? 'Removendo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
