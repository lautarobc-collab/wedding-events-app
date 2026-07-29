"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/(dashboard)/eventos/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <ConfirmDeleteButton
        confirmMessage="¿Eliminar este evento? Esta acción no se puede deshacer."
        onConfirm={async () => {
          setError(null);
          const result = await deleteEvent(eventId);
          if (result?.error) {
            setError(result.error);
            return;
          }
          router.refresh();
        }}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
