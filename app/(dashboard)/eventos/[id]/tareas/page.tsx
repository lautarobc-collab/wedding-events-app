import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { TaskSummary } from "@/components/tasks/TaskSummary";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import type { Task } from "@/lib/types";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return null;

  const supabase = await createClient();
  const { data: tasksData } = await supabase
    .from("tasks")
    .select("*")
    .eq("event_id", id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .returns<Task[]>();

  const tasks = tasksData ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Tareas</h1>

      <TaskSummary tasks={tasks} />

      <TaskTimeline eventId={event.id} tasks={tasks} />

      <NewTaskForm eventId={event.id} />
    </div>
  );
}
