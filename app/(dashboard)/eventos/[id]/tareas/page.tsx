import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { TaskSummary } from "@/components/tasks/TaskSummary";
import { TaskRow } from "@/components/tasks/TaskRow";
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

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} eventId={event.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-neutral-500">Todavía no añadiste tareas.</p>
        )}
      </div>

      <NewTaskForm eventId={event.id} />
    </div>
  );
}
