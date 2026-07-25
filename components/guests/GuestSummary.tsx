import { guestAttendingStatus, latestRsvp } from "@/lib/rsvp";
import type { AttendingStatus, Guest, RsvpResponse } from "@/lib/types";

export function GuestSummary({
  guests,
}: {
  guests: (Guest & { rsvp_responses: RsvpResponse[] })[];
}) {
  const counts: Record<AttendingStatus | "pendiente", number> = {
    si: 0,
    no: 0,
    quizas: 0,
    pendiente: 0,
  };

  let confirmedPeople = 0;

  for (const guest of guests) {
    const status = guestAttendingStatus(guest.rsvp_responses);
    counts[status] += 1;
    if (status === "si") {
      const latest = latestRsvp(guest.rsvp_responses);
      confirmedPeople += 1 + (latest?.confirmed_plus_ones ?? 0);
    }
  }

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Invitados</dt>
        <dd className="font-medium">{guests.length}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Confirmados</dt>
        <dd className="font-medium">{counts.si}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Personas confirmadas</dt>
        <dd className="font-medium">{confirmedPeople}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">No asisten</dt>
        <dd className="font-medium">{counts.no}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Sin responder</dt>
        <dd className="font-medium">{counts.pendiente + counts.quizas}</dd>
      </div>
    </dl>
  );
}
