"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";

export function NewVendorForm({
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
      price: undefined,
      status: "candidato",
      notes: "",
    });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nuevo proveedor</label>
        <input
          placeholder="Nombre"
          {...register("name")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Precio</label>
        <input
          type="number"
          step="0.01"
          {...register("price", {
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
        disabled={isSubmitting}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir"}
      </button>
      {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
