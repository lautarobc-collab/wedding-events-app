import type { TaskRecurrence } from "@/lib/types";

// Si la tarea no tenía fecha límite, la siguiente ocurrencia se calcula
// desde hoy en vez de no tener a qué desplazarse.
export function nextDueDate(dueDate: string | null | undefined, recurrence: TaskRecurrence): string {
  const base = dueDate ? new Date(`${dueDate}T00:00:00`) : new Date();
  if (recurrence === "weekly") {
    base.setDate(base.getDate() + 7);
  } else if (recurrence === "monthly") {
    base.setMonth(base.getMonth() + 1);
  }
  return base.toISOString().slice(0, 10);
}
