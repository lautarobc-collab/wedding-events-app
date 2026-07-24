"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";
import type { Vendor } from "@/lib/types";

export function VendorEditForm({
  eventId,
  vendor,
  onDone,
}: {
  eventId: string;
  vendor: Vendor;
  onDone: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor.name,
      contact_phone: vendor.contact_phone ?? "",
      contact_email: vendor.contact_email ?? "",
      website: vendor.website ?? "",
      price: vendor.price ?? undefined,
      status: vendor.status,
      notes: vendor.notes ?? "",
    },
  });

  async function onSubmit(values: VendorFormValues) {
    setServerError(null);
    const result = await updateVendor(vendor.id, eventId, values);
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
        <label className="text-sm">Nombre</label>
        <input
          {...register("name")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Teléfono</label>
        <input
          {...register("contact_phone")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Email</label>
        <input
          {...register("contact_email")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm">Web</label>
        <input
          {...register("website")}
          className="rounded border border-neutral-300 px-2 py-1"
        />
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
      <div className="flex flex-col gap-1">
        <label className="text-sm">Notas</label>
        <input
          {...register("notes")}
          className="rounded border border-neutral-300 px-2 py-1"
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
