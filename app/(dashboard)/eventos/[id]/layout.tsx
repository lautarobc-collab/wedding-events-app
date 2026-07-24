import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import { EventNav } from "@/components/dashboard/EventNav";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  return (
    <div className="mx-auto flex max-w-5xl gap-8 p-8">
      <EventNav eventId={event.id} eventName={event.name} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
