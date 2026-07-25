"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteVendor, updateVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { formatMoney } from "@/lib/format";
import { VENDOR_STATUS_LABEL, type Vendor, type VendorStatus } from "@/lib/types";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";

const STATUS_STYLES: Record<VendorStatus, string> = {
  candidato: "bg-neutral-100 text-neutral-700",
  contactado: "bg-blue-100 text-blue-700",
  elegido: "bg-green-100 text-green-700",
  descartado: "bg-red-100 text-red-700 line-through",
};

export function VendorCard({ eventId, vendor }: { eventId: string; vendor: Vendor }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
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
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="rounded border border-neutral-200 p-3 hover:border-neutral-300">
      <InlineEditable
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onCommit={handleSubmit(onSubmit)}
        display={
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{vendor.name}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[vendor.status]}`}
              >
                {VENDOR_STATUS_LABEL[vendor.status]}
              </span>
            </div>

            {vendor.price != null && (
              <p className="text-sm text-neutral-600">{formatMoney(vendor.price)}</p>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
              {vendor.contact_phone && <span>Tel: {vendor.contact_phone}</span>}
              {vendor.contact_email && <span>{vendor.contact_email}</span>}
              {vendor.website && <span>{vendor.website}</span>}
            </div>

            {vendor.notes && <p className="text-sm text-neutral-500">{vendor.notes}</p>}
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <input
            autoFocus
            placeholder="Nombre"
            {...register("name")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          <input
            placeholder="Teléfono"
            {...register("contact_phone")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            placeholder="Email"
            {...register("contact_email")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            placeholder="Web"
            {...register("website")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="number"
            step="1"
            placeholder="Precio"
            {...register("price", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <select
            {...register("status")}
            className="rounded border border-neutral-300 px-2 py-1"
          >
            <option value="candidato">Candidato</option>
            <option value="contactado">Contactado</option>
            <option value="elegido">Elegido</option>
            <option value="descartado">Descartado</option>
          </select>
          <input
            placeholder="Notas"
            {...register("notes")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <p className="text-xs text-neutral-400">Enter para guardar · Esc para cancelar</p>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </form>
      </InlineEditable>

      {!editing && (
        <div className="mt-2">
          <ConfirmDeleteButton
            confirmMessage={`¿Eliminar a "${vendor.name}"?`}
            onConfirm={async () => {
              await deleteVendor(vendor.id, eventId);
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
