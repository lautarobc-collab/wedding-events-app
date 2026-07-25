"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteTask, updateTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { TASK_STATUS_LABEL, type Task } from "@/lib/types";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";

export function TaskRow({ eventId, task }: { eventId: string; task: Task }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      due_date: task.due_date ?? "",
      status: task.status,
      notes: task.notes ?? "",
    },
  });

  async function onSubmit(values: TaskFormValues) {
    setServerError(null);
    const result = await updateTask(task.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);
  const overdue = task.status !== "completado" && !!task.due_date && task.due_date < today;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded border px-4 py-3 text-sm ${
        overdue ? "border-red-200 bg-red-50" : "border-neutral-200"
      }`}
    >
      <InlineEditable
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onCommit={handleSubmit(onSubmit)}
        className="flex-1"
        display={
          <div>
            <p className="font-medium">{task.title}</p>
            <p className={overdue ? "text-red-600" : "text-neutral-500"}>
              {TASK_STATUS_LABEL[task.status]}
              {task.due_date ? ` · Vence ${task.due_date}` : ""}
              {overdue ? " · Vencida" : ""}
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-2">
          <input
            autoFocus
            placeholder="Título"
            {...register("title")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="date"
            {...register("due_date")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <select
            {...register("status")}
            className="rounded border border-neutral-300 px-2 py-1"
          >
            <option value="sin_empezar">Sin empezar</option>
            <option value="en_curso">En curso</option>
            <option value="completado">Completado</option>
          </select>
          <input
            placeholder="Notas"
            {...register("notes")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <p className="w-full text-xs text-neutral-400">Enter para guardar · Esc para cancelar</p>
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </form>
      </InlineEditable>

      {!editing && (
        <ConfirmDeleteButton
          confirmMessage={`¿Eliminar la tarea "${task.title}"?`}
          onConfirm={async () => {
            await deleteTask(task.id, eventId);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
