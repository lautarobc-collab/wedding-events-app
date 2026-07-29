import { TableCard } from "./TableCard";
import { NewTableForm } from "./NewTableForm";
import { GuestTableSelect } from "./GuestTableSelect";
import type { Guest, GuestCompanion, SeatingTable } from "@/lib/types";

type GuestWithCompanions = Guest & { guest_companions: GuestCompanion[] };

export function MesasView({
  eventId,
  tables,
  guests,
}: {
  eventId: string;
  tables: SeatingTable[];
  guests: GuestWithCompanions[];
}) {
  const guestsByTable = new Map<string, GuestWithCompanions[]>();
  const unassigned: GuestWithCompanions[] = [];

  for (const guest of guests) {
    if (guest.table_id) {
      const list = guestsByTable.get(guest.table_id) ?? [];
      list.push(guest);
      guestsByTable.set(guest.table_id, list);
    } else {
      unassigned.push(guest);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {tables.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              eventId={eventId}
              table={table}
              guests={guestsByTable.get(table.id) ?? []}
              allTables={tables}
            />
          ))}
        </div>
      )}

      <NewTableForm eventId={eventId} sortOrder={tables.length} />

      <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="mb-3 font-medium">Sin mesa asignada</h2>
        <div className="flex flex-col gap-2">
          {unassigned.map((guest) => (
            <div key={guest.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {guest.first_name} {guest.last_name ?? ""}
                {guest.guest_companions.length > 0 && (
                  <span className="text-neutral-400 dark:text-neutral-500">
                    {" "}
                    (+{guest.guest_companions.length})
                  </span>
                )}
              </span>
              <GuestTableSelect
                eventId={eventId}
                guestId={guest.id}
                currentTableId={null}
                tables={tables}
              />
            </div>
          ))}
          {unassigned.length === 0 && (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              {guests.length === 0
                ? "Todavía no añadiste invitados."
                : "Todos los invitados tienen mesa asignada."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
