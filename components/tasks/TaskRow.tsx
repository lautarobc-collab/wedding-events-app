"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteTask, updateTask } from "@/app/(dashboard)/eventos/[id]/tareas/actions";
import { TASK_STATUS_LABEL, type BudgetItem, type Category, type Guest, type Task, type Vendor } from "@/lib/types";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";
import { TaskLinkPicker } from "@/components/tasks/TaskLinkPicker";
import { describeTaskLink, resolveTaskLink, taskLinkToKindAndRef, type TaskLinkKind } from "@/lib/taskLinks";

export function TaskRow({
  eventId,
  task,
  guests,
  budgetItems,
  vendors,
  categories,
}: {
  eventId: string;
  task: Task;
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  categories: Category[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const initialLink = taskLinkToKindAndRef(task);
  const [linkKind, setLinkKind] = useState<"" | TaskLinkKind>(initialLink.kind);
  const [linkRefId, setLinkRefId] = useState(initialLink.refId);
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
    const result = await updateTask(task.id, eventId, values, resolveTaskLink(linkKind, linkRefId));
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);
  const overdue = task.status !== "completado" && !!task.due_date && task.due_date < today;
  const link = describeTaskLink(task, eventId, { guests, budgetItems, vendors, categories });

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded border px-4 py-3 text-sm ${
        overdue ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950" : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <InlineEditable
        editing={editing}
        onStartEdit={() => {
          setLinkKind(initialLink.kind);
          setLinkRefId(initialLink.refId);
          setEditing(true);
        }}
        onCancel={() => setEditing(false)}
        onCommit={handleSubmit(onSubmit)}
        className="flex-1"
        display={
          <div>
            <p className="font-medium">{task.title}</p>
            <p className={overdue ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400"}>
              {TASK_STATUS_LABEL[task.status]}
              {task.due_date ? ` · Vence ${task.due_date}` : ""}
              {overdue ? " · Vencida" : ""}
            </p>
            {link && (
              <Link
                href={link.href}
                onClick={(event) => event.stopPropagation()}
                className="mt-1 inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600"
              >
                {link.label}
              </Link>
            )}
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              autoFocus
              placeholder="Título"
              {...register("title")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              type="date"
              {...register("due_date")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <select
              {...register("status")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            >
              <option value="sin_empezar">Sin empezar</option>
              <option value="en_curso">En curso</option>
              <option value="completado">Completado</option>
            </select>
            <input
              placeholder="Notas"
              {...register("notes")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
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
          {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
          {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}
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
