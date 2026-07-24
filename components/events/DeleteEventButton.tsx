"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/app/(dashboard)/eventos/actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Eliminar este evento? Esta acción no se puede deshacer.")) {
      return;
    }
    startTransition(() => {
      deleteEvent(eventId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-red-600 underline disabled:opacity-50"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
