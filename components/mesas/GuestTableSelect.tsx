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

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    await assignGuestTable(guestId, eventId, event.target.value || null);
    setPending(false);
    router.refresh();
  }

  return (
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
  );
}
