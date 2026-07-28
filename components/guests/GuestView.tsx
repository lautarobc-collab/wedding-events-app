"use client";

import { useState } from "react";
import { GuestSummary } from "./GuestSummary";
import { GuestChart } from "./GuestChart";
import { GuestRow } from "./GuestRow";
import { NewGuestForm } from "./NewGuestForm";
import { ImportGuestsForm } from "./ImportGuestsForm";
import { guestStatus, type GuestStatus } from "@/lib/rsvp";
import type { Guest, GuestCompanion, RsvpResponse } from "@/lib/types";

type GuestWithChildren = Guest & {
  rsvp_responses: RsvpResponse[];
  guest_companions: GuestCompanion[];
};

export function GuestView({
  eventId,
  slug,
  guests,
}: {
  eventId: string;
  slug: string | null;
  guests: GuestWithChildren[];
}) {
  const [selected, setSelected] = useState<GuestStatus | null>(null);

  const statusByGuestId = new Map(
    guests.map((guest) => [guest.id, guestStatus(guest.invitation_status, guest.rsvp_responses)]),
  );

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

  return (
    <>
      <GuestSummary guests={guests} />
      <GuestChart counts={counts} selected={selected} onSelect={setSelected} />

      <div className="flex flex-col gap-2">
        {visibleGuests.map((guest) => (
          <GuestRow key={guest.id} eventId={eventId} slug={slug} guest={guest} />
        ))}
        {visibleGuests.length === 0 && (
          <p className="text-sm text-neutral-500">
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
