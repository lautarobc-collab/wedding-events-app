"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { TASK_STATUS_LABEL, type Task } from "@/lib/types";
import { TaskEditForm } from "./TaskEditForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export function TaskRow({ eventId, task }: { eventId: string; task: Task }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <TaskEditForm eventId={eventId} task={task} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-200 px-4 py-3 text-sm">
      <div>
        <p className="font-medium">{task.title}</p>
        <p className="text-neutral-500">
          {TASK_STATUS_LABEL[task.status]}
          {task.due_date ? ` · Vence ${task.due_date}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setEditing(true)} className="underline">
          Editar
        </button>
        <ConfirmDeleteButton
          confirmMessage={`¿Eliminar la tarea "${task.title}"?`}
          onConfirm={async () => {
            await deleteTask(task.id, eventId);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
