import { groupTasksByMonth } from "@/lib/taskGroups";
import { TaskRow } from "./TaskRow";
import type { Task } from "@/lib/types";

export function TaskTimeline({ eventId, tasks }: { eventId: string; tasks: Task[] }) {
  const groups = groupTasksByMonth(tasks);

  if (groups.length === 0) {
    return <p className="text-sm text-neutral-500">Todavía no añadiste tareas.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 text-sm font-medium capitalize text-neutral-500">
            {group.label}
          </h3>
          <div className="flex flex-col gap-2">
            {group.tasks.map((task) => (
              <TaskRow key={task.id} eventId={eventId} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
