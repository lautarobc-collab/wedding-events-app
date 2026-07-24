"use client";

import { useTransition } from "react";

export function ConfirmDeleteButton({
  confirmMessage,
  onConfirm,
  label = "Eliminar",
  pendingLabel = "Eliminando...",
  className = "text-sm text-red-600 underline disabled:opacity-50",
}: {
  confirmMessage: string;
  onConfirm: () => unknown;
  label?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(() => {
      onConfirm();
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={className}>
      {isPending ? pendingLabel : label}
    </button>
  );
}
