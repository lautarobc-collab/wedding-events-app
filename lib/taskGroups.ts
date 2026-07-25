import type { Task } from "@/lib/types";

export type TaskGroup = {
  key: string;
  label: string;
  tasks: Task[];
};

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function groupTasksByMonth(tasks: Task[]): TaskGroup[] {
  const withDate = tasks.filter((task) => task.due_date);
  const withoutDate = tasks.filter((task) => !task.due_date);

  const buckets = new Map<string, Task[]>();
  for (const task of withDate) {
    const [year, month] = task.due_date!.split("-");
    const key = `${year}-${month}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(task);
  }

  const groups: TaskGroup[] = [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, groupTasks]) => {
      const [year, month] = key.split("-");
      return {
        key,
        label: `${MONTH_LABELS[Number(month) - 1]} ${year}`,
        tasks: [...groupTasks].sort((a, b) =>
          (a.due_date ?? "") < (b.due_date ?? "") ? -1 : 1,
        ),
      };
    });

  if (withoutDate.length > 0) {
    groups.push({ key: "sin-fecha", label: "Sin fecha", tasks: withoutDate });
  }

  return groups;
}
