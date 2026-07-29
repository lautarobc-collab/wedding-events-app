"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { createCategory } from "@/app/(dashboard)/eventos/[id]/presupuesto/actions";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";
import type { Category } from "@/lib/types";

const NEW_CATEGORY_VALUE = "__new__";

export function NewVendorForm({
  eventId,
  categories,
}: {
  eventId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? NEW_CATEGORY_VALUE);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { status: "candidato" },
  });

  async function onSubmit(values: VendorFormValues) {
    setServerError(null);

    let targetCategoryId = categoryId;
    if (categoryId === NEW_CATEGORY_VALUE) {
      if (!newCategoryName.trim()) {
        setServerError("Ponle un nombre a la nueva categoría.");
        return;
      }
      const categoryResult = await createCategory(eventId, newCategoryName.trim(), categories.length);
      if (categoryResult?.error || !categoryResult?.id) {
        setServerError(categoryResult?.error ?? "No se pudo crear la categoría.");
        return;
      }
      targetCategoryId = categoryResult.id;
    }

    const result = await createVendor(targetCategoryId, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({
      name: "",
      contact_phone: "",
      contact_email: "",
      website: "",
      estimated: undefined,
      actual: undefined,
      status: "candidato",
      notes: "",
    });
    setNewCategoryName("");
    setCategoryId(categories[0]?.id ?? NEW_CATEGORY_VALUE);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-100"
      >
        + Nuevo proveedor
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-2 rounded border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Categoría</label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>+ Nueva categoría</option>
        </select>
      </div>
      {categoryId === NEW_CATEGORY_VALUE && (
        <div className="flex flex-col gap-1">
          <label className="text-sm">Nombre de la nueva categoría</label>
          <input
            placeholder="Ej. Flores"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nombre</label>
        <input
          autoFocus
          placeholder="Nombre del proveedor"
          {...register("name")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estimado</label>
        <input
          type="number"
          step="1"
          {...register("estimated", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
          className="w-28 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estado</label>
        <select
          {...register("status")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
        >
          <option value="candidato">Candidato</option>
          <option value="contactado">Contactado</option>
          <option value="elegido">Elegido</option>
          <option value="descartado">Descartado</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={
          isSubmitting || !categoryId || (categoryId === NEW_CATEGORY_VALUE && !newCategoryName.trim())
        }
        className="rounded bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-sm text-white dark:text-neutral-900 disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400"
      >
        Cancelar
      </button>
      {serverError && <p className="w-full text-sm text-red-600 dark:text-red-400">{serverError}</p>}
    </form>
  );
}
