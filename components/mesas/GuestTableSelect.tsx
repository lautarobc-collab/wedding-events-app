"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignGuestTable } from "@/app/(dashboard)/eventos/[id]/mesas/actions";
import type { SeatingTable } from "@/lib/types";

export function GuestTableSelect({
  eventId,
  guestId,
  currentTableId,
  tables,
}: {
  eventId: string;
  guestId: string;
  currentTableId: string | null;
  tables: SeatingTable[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setError(null);
    setPending(true);
    const result = await assignGuestTable(guestId, eventId, event.target.value || null);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={currentTableId ?? ""}
        disabled={pending}
        onChange={handleChange}
        className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-sm disabled:opacity-50"
      >
        <option value="">Sin mesa</option>
        {tables.map((table) => (
          <option key={table.id} value={table.id}>
            {table.name}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
