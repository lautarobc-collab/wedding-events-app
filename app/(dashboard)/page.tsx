import { createClient } from "@/lib/supabase/server";
import { NewEventForm } from "@/components/events/NewEventForm";
import { EventListItem } from "@/components/events/EventListItem";
import type { Event } from "@/lib/types";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_type, event_date, created_at")
    .order("created_at", { ascending: false })
    .returns<Pick<Event, "id" | "name" | "event_type" | "event_date" | "created_at">[]>();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-xl font-semibold">Tus eventos</h1>
        <p className="text-sm text-neutral-600">
          Elige un evento o crea uno nuevo.
        </p>
      </div>

      <NewEventForm />

      <ul className="flex flex-col gap-2">
        {events?.length ? (
          events.map((event) => <EventListItem key={event.id} event={event} />)
        ) : (
          <p className="text-sm text-neutral-500">Todavía no tienes eventos.</p>
        )}
      </ul>
    </main>
  );
}
