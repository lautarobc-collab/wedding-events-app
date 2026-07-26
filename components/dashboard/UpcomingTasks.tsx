import Link from "next/link";
import type { Task } from "@/lib/types";

function isOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dueDate}T00:00:00`).getTime() < today.getTime();
}

export function UpcomingTasks({ eventId, tasks }: { eventId: string; tasks: Task[] }) {
  const upcoming = tasks
    .filter((task) => task.status !== "completado")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 5);

  return (
    <div className="rounded border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">Próximas tareas</h2>
        <Link href={`/eventos/${eventId}/tareas`} className="text-sm text-neutral-600 underline">
          Ver todas
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-neutral-400">No tienes tareas pendientes.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {upcoming.map((task) => {
            const overdue = task.due_date ? isOverdue(task.due_date) : false;
            return (
              <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{task.title}</span>
                <span className={overdue ? "font-medium text-red-600" : "text-neutral-500"}>
                  {task.due_date ?? "Sin fecha"}
                  {overdue ? " · atrasada" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
