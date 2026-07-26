"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBudgetItem } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import {
  budgetItemSchema,
  type BudgetItemFormValues,
} from "@/lib/validations/budgetItem";

export function NewBudgetItemForm({
  eventId,
  categoryId,
}: {
  eventId: string;
  categoryId: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: { estimated: 0, actual: 0 },
  });

  async function onSubmit(values: BudgetItemFormValues) {
    setServerError(null);
    const result = await createBudgetItem(categoryId, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({ description: "", estimated: 0, actual: 0 });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nuevo gasto</label>
        <input
          placeholder="Descripción"
          {...register("description")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estimado</label>
        <input
          type="number"
          step="1"
          {...register("estimated", { valueAsNumber: true })}
          className="w-28 rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Real</label>
        <input
          type="number"
          step="1"
          {...register("actual", { valueAsNumber: true })}
          className="w-28 rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir"}
      </button>
      {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
