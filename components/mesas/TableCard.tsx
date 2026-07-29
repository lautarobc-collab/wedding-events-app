"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteTable, updateTable } from "@/app/(dashboard)/eventos/[id]/mesas/actions";
import { tableSchema, type TableFormValues } from "@/lib/validations/table";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";
import { GuestTableSelect } from "./GuestTableSelect";
import type { Guest, GuestCompanion, SeatingTable } from "@/lib/types";

type GuestWithCompanions = Guest & { guest_companions: GuestCompanion[] };

export function TableCard({
  eventId,
  table,
  guests,
  allTables,
}: {
  eventId: string;
  table: SeatingTable;
  guests: GuestWithCompanions[];
  allTables: SeatingTable[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: { name: table.name, capacity: table.capacity },
  });

  async function onSubmit(values: TableFormValues) {
    setServerError(null);
    const result = await updateTable(table.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  // Sillas ocupadas: cada invitado cuenta como 1 + sus acompañantes
  // invitados (no los confirmados por RSVP, que pueden estar todavía sin
  // responder) — es una herramienta de planificación previa al evento.
  const occupied = guests.reduce((sum, guest) => sum + 1 + guest.guest_companions.length, 0);
  const over = occupied > table.capacity;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <InlineEditable
          editing={editing}
          onStartEdit={() => setEditing(true)}
          onCancel={() => setEditing(false)}
          onCommit={handleSubmit(onSubmit)}
          className="flex-1"
          display={
            <div>
              <h2 className="font-medium">{table.name}</h2>
              <p className={over ? "text-sm text-red-600 dark:text-red-400" : "text-sm text-neutral-500 dark:text-neutral-400"}>
                {occupied} / {table.capacity} sitios{over ? " · aforo superado" : ""}
              </p>
            </div>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2">
            <input
              autoFocus
              {...register("name")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              type="number"
              min={1}
              {...register("capacity", { valueAsNumber: true })}
              className="w-20 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            {errors.name && <p className="w-full text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            {serverError && <p className="w-full text-sm text-red-600 dark:text-red-400">{serverError}</p>}
          </form>
        </InlineEditable>

        {!editing && (
          <ConfirmDeleteButton
            label="Eliminar mesa"
            confirmMessage={`¿Eliminar "${table.name}"? Sus invitados quedarán sin mesa asignada.`}
            onConfirm={async () => {
              await deleteTable(table.id, eventId);
              router.refresh();
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {guests.map((guest) => (
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
              currentTableId={table.id}
              tables={allTables}
            />
          </div>
        ))}
        {guests.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Sin invitados asignados.</p>
        )}
      </div>
    </div>
  );
}
