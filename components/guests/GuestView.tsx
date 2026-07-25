"use client";

import { useState } from "react";
import { GuestSummary } from "./GuestSummary";
import { GuestChart } from "./GuestChart";
import { GuestRow } from "./GuestRow";
import { NewGuestForm } from "./NewGuestForm";
import { guestAttendingStatus } from "@/lib/rsvp";
import type { AttendingStatus, Guest, RsvpResponse } from "@/lib/types";

type FilterValue = AttendingStatus | "pendiente";
type GuestWithRsvp = Guest & { rsvp_responses: RsvpResponse[] };

export function GuestView({
  eventId,
  slug,
  guests,
}: {
  eventId: string;
  slug: string | null;
  guests: GuestWithRsvp[];
}) {
  const [selected, setSelected] = useState<FilterValue | null>(null);

  const counts: Record<FilterValue, number> = { si: 0, no: 0, quizas: 0, pendiente: 0 };
  for (const guest of guests) {
    counts[guestAttendingStatus(guest.rsvp_responses)] += 1;
  }

  const visibleGuests = selected
    ? guests.filter((guest) => guestAttendingStatus(guest.rsvp_responses) === selected)
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
    </>
  );
}
