import type { Task, TaskStatus } from "@/lib/types";

export function TaskSummary({ tasks }: { tasks: Task[] }) {
  const counts: Record<TaskStatus, number> = {
    sin_empezar: 0,
    en_curso: 0,
    completado: 0,
  };

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Tareas</dt>
        <dd className="font-medium">{tasks.length}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Sin empezar</dt>
        <dd className="font-medium">{counts.sin_empezar}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">En curso</dt>
        <dd className="font-medium">{counts.en_curso}</dd>
      </div>
      <div className="rounded border border-neutral-200 p-4">
        <dt className="text-sm text-neutral-500">Completadas</dt>
        <dd className="font-medium">{counts.completado}</dd>
      </div>
    </dl>
  );
}
