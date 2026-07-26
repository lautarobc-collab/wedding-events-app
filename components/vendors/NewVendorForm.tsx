"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";
import type { Category } from "@/lib/types";

export function NewVendorForm({
  eventId,
  categories,
}: {
  eventId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
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
    const result = await createVendor(categoryId, eventId, values);
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
    setOpen(false);
    router.refresh();
  }

  if (categories.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:border-neutral-900"
      >
        + Nuevo proveedor
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-2 rounded border border-neutral-200 p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Categoría</label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nombre</label>
        <input
          autoFocus
          placeholder="Nombre del proveedor"
          {...register("name")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estimado</label>
        <input
          type="number"
          step="1"
          {...register("estimated", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
          className="w-28 rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Estado</label>
        <select
          {...register("status")}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="candidato">Candidato</option>
          <option value="contactado">Contactado</option>
          <option value="elegido">Elegido</option>
          <option value="descartado">Descartado</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !categoryId}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2 py-1.5 text-sm text-neutral-500"
      >
        Cancelar
      </button>
      {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
