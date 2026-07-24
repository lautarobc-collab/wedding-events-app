import Link from "next/link";
import { EVENT_TYPE_LABEL, type Event } from "@/lib/types";
import { DeleteEventButton } from "./DeleteEventButton";

type EventListItemData = Pick<Event, "id" | "name" | "event_type" | "event_date">;

export function EventListItem({ event }: { event: EventListItemData }) {
  return (
    <li className="flex items-center justify-between rounded border border-neutral-200 px-4 py-3">
      <Link href={`/eventos/${event.id}`} className="flex flex-col">
        <span className="font-medium">{event.name}</span>
        <span className="text-sm text-neutral-500">
          {EVENT_TYPE_LABEL[event.event_type]}
          {event.event_date ? ` · ${event.event_date}` : ""}
        </span>
      </Link>
      <DeleteEventButton eventId={event.id} />
    </li>
  );
}
