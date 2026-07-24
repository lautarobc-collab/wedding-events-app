"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { newCategorySchema, type NewCategoryFormValues } from "@/lib/validations/category";

export function NewCategoryForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewCategoryFormValues>({ resolver: zodResolver(newCategorySchema) });

  async function onSubmit(values: NewCategoryFormValues) {
    setServerError(null);
    const result = await createCategory(eventId, values.name);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({ name: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="new-category-name" className="text-sm font-medium">
          Nueva categoría
        </label>
        <input
          id="new-category-name"
          {...register("name")}
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir categoría"}
      </button>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
