import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { count: overdueTasksCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id)
    .neq("status", "completado")
    .lt("due_date", today);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:flex-row sm:gap-8 sm:p-8">
      <EventNav eventId={event.id} eventName={event.name} overdueTasksCount={overdueTasksCount ?? 0} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
