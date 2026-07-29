"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTable } from "@/app/(dashboard)/eventos/[id]/mesas/actions";
import { tableSchema, type TableFormValues } from "@/lib/validations/table";

export function NewTableForm({ eventId, sortOrder }: { eventId: string; sortOrder: number }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: { capacity: 8 },
  });

  async function onSubmit(values: TableFormValues) {
    setServerError(null);
    const result = await createTable(eventId, values, sortOrder);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({ name: "", capacity: 8 });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-2 rounded border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nombre de la mesa</label>
        <input
          placeholder="Mesa 1"
          {...register("name")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Aforo</label>
        <input
          type="number"
          min={1}
          {...register("capacity", { valueAsNumber: true })}
          className="w-20 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-white dark:text-neutral-900 disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir mesa"}
      </button>
      {serverError && <p className="w-full text-sm text-red-600 dark:text-red-400">{serverError}</p>}
    </form>
  );
}
