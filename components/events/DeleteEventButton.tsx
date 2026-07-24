"use client";

import { deleteEvent } from "@/app/(dashboard)/eventos/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <ConfirmDeleteButton
      confirmMessage="¿Eliminar este evento? Esta acción no se puede deshacer."
      onConfirm={() => deleteEvent(eventId)}
    />
  );
}
