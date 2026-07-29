"use client";

import { useState } from "react";
import { GuestSummary } from "./GuestSummary";
import { GuestChart } from "./GuestChart";
import { GuestRow } from "./GuestRow";
import { NewGuestForm } from "./NewGuestForm";
import { ImportGuestsForm } from "./ImportGuestsForm";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { guestStatus, latestRsvp, GUEST_STATUS_LABEL, type GuestStatus } from "@/lib/rsvp";
import { toCsv } from "@/lib/exportCsv";
import type { Guest, GuestCompanion, RsvpResponse, SeatingTable } from "@/lib/types";

type GuestWithChildren = Guest & {
  rsvp_responses: RsvpResponse[];
  guest_companions: GuestCompanion[];
};

export function GuestView({
  eventId,
  slug,
  guests,
  tables,
}: {
  eventId: string;
  slug: string | null;
  guests: GuestWithChildren[];
  tables: SeatingTable[];
}) {
  const [selected, setSelected] = useState<GuestStatus | null>(null);

  const statusByGuestId = new Map(
    guests.map((guest) => [guest.id, guestStatus(guest.invitation_status, guest.rsvp_responses)]),
  );
  const tableNameById = new Map(tables.map((table) => [table.id, table.name]));

  const counts: Record<GuestStatus, number> = {
    por_decidir: 0,
    invitado: 0,
    si: 0,
    no: 0,
    quizas: 0,
  };
  for (const status of statusByGuestId.values()) {
    counts[status] += 1;
  }

  const visibleGuests = selected
    ? guests.filter((guest) => statusByGuestId.get(guest.id) === selected)
    : guests;

  const csv = toCsv(guests, [
    { label: "Nombre", value: (g) => g.first_name },
    { label: "Apellidos", value: (g) => g.last_name },
    { label: "Email", value: (g) => g.email },
    { label: "Invitado por", value: (g) => g.invited_by },
    { label: "Mesa", value: (g) => (g.table_id ? tableNameById.get(g.table_id) : null) },
    { label: "Estado", value: (g) => GUEST_STATUS_LABEL[statusByGuestId.get(g.id)!] },
    { label: "Acompañantes confirmados", value: (g) => latestRsvp(g.rsvp_responses)?.confirmed_plus_ones },
    { label: "Niños confirmados", value: (g) => latestRsvp(g.rsvp_responses)?.confirmed_children },
    { label: "Restricciones alimentarias", value: (g) => g.dietary_restrictions },
  ]);

  return (
    <>
      <ExportCsvButton filename="invitados.csv" csv={csv} />
      <GuestSummary guests={guests} />
      <GuestChart counts={counts} selected={selected} onSelect={setSelected} />

      <div className="flex flex-col gap-2">
        {visibleGuests.map((guest) => (
          <GuestRow key={guest.id} eventId={eventId} slug={slug} guest={guest} tables={tables} />
        ))}
        {visibleGuests.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {guests.length === 0
              ? "Todavía no añadiste invitados."
              : "Ningún invitado coincide con el filtro."}
          </p>
        )}
      </div>

      <NewGuestForm eventId={eventId} />
      <ImportGuestsForm eventId={eventId} />
    </>
  );
}
