"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import type { Category } from "@/lib/types";

export function CategoryEditForm({
  eventId,
  category,
  onDone,
}: {
  eventId: string;
  category: Category;
  onDone: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      estimated_amount: category.estimated_amount,
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null);
    const result = await updateCategory(category.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor={`name-${category.id}`} className="text-sm font-medium">
          Nombre
        </label>
        <input
          id={`name-${category.id}`}
          {...register("name")}
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`amount-${category.id}`} className="text-sm font-medium">
          Estimado
        </label>
        <input
          id={`amount-${category.id}`}
          type="number"
          step="0.01"
          {...register("estimated_amount", { valueAsNumber: true })}
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {errors.estimated_amount && (
          <p className="text-sm text-red-600">{errors.estimated_amount.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded border border-neutral-300 px-3 py-2 text-sm"
      >
        Cancelar
      </button>
      {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
