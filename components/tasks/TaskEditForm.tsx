"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import type { Task } from "@/lib/types";

export function TaskEditForm({
  eventId,
  task,
  onDone,
}: {
  eventId: string;
  task: Task;
  onDone: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    onDone();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-2 rounded bg-neutral-50 p-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Título</label>
        <input
          {...register("title")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Fecha límite</label>
        <input
          type="date"
          {...register("due_date")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estado</label>
        <select
          {...register("status")}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="sin_empezar">Sin empezar</option>
          <option value="en_curso">En curso</option>
          <option value="completado">Completado</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Notas</label>
        <input
          {...register("notes")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
      >
        Cancelar
      </button>
      {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
