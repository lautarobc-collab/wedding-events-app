"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBudgetItem } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import {
  budgetItemSchema,
  type BudgetItemFormValues,
} from "@/lib/validations/budgetItem";
import type { BudgetItem } from "@/lib/types";

export function BudgetItemEditForm({
  eventId,
  item,
  onDone,
}: {
  eventId: string;
  item: BudgetItem;
  onDone: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      description: item.description,
      estimated: item.estimated,
      actual: item.actual,
    },
  });

  async function onSubmit(values: BudgetItemFormValues) {
    setServerError(null);
    const result = await updateBudgetItem(item.id, eventId, values);
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
        <label className="text-sm">Descripción</label>
        <input
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
          step="0.01"
          {...register("estimated", { valueAsNumber: true })}
          className="w-28 rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Real</label>
        <input
          type="number"
          step="0.01"
          {...register("actual", { valueAsNumber: true })}
          className="w-28 rounded border border-neutral-300 px-2 py-1"
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
