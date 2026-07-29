import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { GuestView } from "@/components/guests/GuestView";
import { guestAttendingStatus } from "@/lib/rsvp";
import type { Guest, GuestCompanion, RsvpResponse, SeatingTable } from "@/lib/types";

type GuestWithChildren = Guest & {
  rsvp_responses: RsvpResponse[];
  guest_companions: GuestCompanion[];
};

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return null;

  const supabase = await createClient();
  const [{ data: guestsData }, { data: tablesData }] = await Promise.all([
    supabase
      .from("guests")
      .select("*, rsvp_responses(*), guest_companions(*)")
      .eq("event_id", id)
      .order("first_name", { ascending: true })
      .returns<GuestWithChildren[]>(),
    supabase
      .from("tables")
      .select("*")
      .eq("event_id", id)
      .order("sort_order", { ascending: true })
      .returns<SeatingTable[]>(),
  ]);

  const guests = guestsData ?? [];
  const tables = tablesData ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const deadlinePassed = event.rsvp_deadline != null && event.rsvp_deadline < today;
  const pendingGuests = guests.filter(
    (guest) => guestAttendingStatus(guest.rsvp_responses) === "pendiente",
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Invitados</h1>
      {deadlinePassed && pendingGuests.length > 0 && (
        <p className="rounded border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          La fecha límite de RSVP ({event.rsvp_deadline}) ya pasó y {pendingGuests.length}{" "}
          {pendingGuests.length === 1 ? "invitado sigue sin responder" : "invitados siguen sin responder"}.
        </p>
      )}
      <GuestView eventId={event.id} slug={event.public_slug} guests={guests} tables={tables} />
    </div>
  );
}
