"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import { resolveTaskLink, type TaskLinkKind } from "@/lib/taskLinks";
import { TaskLinkPicker } from "@/components/tasks/TaskLinkPicker";
import type { BudgetItem, Category, Guest, Vendor } from "@/lib/types";

export function NewTaskForm({
  eventId,
  guests,
  budgetItems,
  vendors,
  categories,
}: {
  eventId: string;
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  categories: Category[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [linkKind, setLinkKind] = useState<"" | TaskLinkKind>("");
  const [linkRefId, setLinkRefId] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: "sin_empezar" },
  });

  async function onSubmit(values: TaskFormValues) {
    setServerError(null);
    const result = await createTask(eventId, values, resolveTaskLink(linkKind, linkRefId));
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({ title: "", due_date: "", status: "sin_empezar", notes: "" });
    setLinkKind("");
    setLinkRefId("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded border border-neutral-200 p-4"
    >
      <h2 className="font-medium">Nueva tarea</h2>
      <div className="flex flex-wrap gap-2">
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
      </div>

      <TaskLinkPicker
        kind={linkKind}
        onKindChange={setLinkKind}
        refId={linkRefId}
        onRefIdChange={setLinkRefId}
        guests={guests}
        budgetItems={budgetItems}
        vendors={vendors}
        categories={categories}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir tarea"}
      </button>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
