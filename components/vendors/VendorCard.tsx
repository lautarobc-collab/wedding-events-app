"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteVendor, updateVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { formatMoney } from "@/lib/format";
import { VENDOR_STATUS_LABEL, type Vendor, type VendorAttachment, type VendorStatus } from "@/lib/types";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";
import { VendorAttachments } from "./VendorAttachments";
import { StarRatingDisplay, StarRatingInput } from "./StarRating";

const STATUS_STYLES: Record<VendorStatus, string> = {
  candidato: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
  contactado: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  elegido: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  descartado: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 line-through",
};

export function VendorCard({
  eventId,
  vendor,
  attachments,
  signedUrlByPath,
}: {
  eventId: string;
  vendor: Vendor;
  attachments: VendorAttachment[];
  signedUrlByPath: Map<string, string>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor.name,
      contact_phone: vendor.contact_phone ?? "",
      contact_email: vendor.contact_email ?? "",
      website: vendor.website ?? "",
      estimated: vendor.estimated ?? undefined,
      actual: vendor.actual ?? undefined,
      status: vendor.status,
      notes: vendor.notes ?? "",
      rating: vendor.rating ?? undefined,
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
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 hover:border-neutral-300 dark:hover:border-neutral-700">
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

            <StarRatingDisplay rating={vendor.rating} />

            {(vendor.estimated != null || vendor.actual != null) && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {vendor.estimated != null ? `${formatMoney(vendor.estimated)} est.` : ""}
                {vendor.estimated != null && vendor.actual != null ? " / " : ""}
                {vendor.actual != null ? `${formatMoney(vendor.actual)} real` : ""}
              </p>
            )}

            {vendor.status === "elegido" && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Tiene una línea de gasto vinculada en Presupuesto.
              </p>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              {vendor.contact_phone && <span>Tel: {vendor.contact_phone}</span>}
              {vendor.contact_email && <span>{vendor.contact_email}</span>}
              {vendor.website && <span>{vendor.website}</span>}
            </div>

            {vendor.notes && <p className="text-sm text-neutral-500 dark:text-neutral-400">{vendor.notes}</p>}
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <input
            autoFocus
            placeholder="Nombre"
            {...register("name")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
          {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
          <input
            placeholder="Teléfono"
            {...register("contact_phone")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
          <input
            placeholder="Email"
            {...register("contact_email")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
          <input
            placeholder="Web"
            {...register("website")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="1"
              placeholder="Estimado"
              {...register("estimated", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className="w-1/2 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              type="number"
              step="1"
              placeholder="Real"
              {...register("actual", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className="w-1/2 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
          </div>
          <select
            {...register("status")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          >
            <option value="candidato">Candidato</option>
            <option value="contactado">Contactado</option>
            <option value="elegido">Elegido</option>
            <option value="descartado">Descartado</option>
          </select>
          <input
            placeholder="Notas"
            {...register("notes")}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRatingInput value={field.value} onChange={field.onChange} />
            )}
          />
          {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}
        </form>
      </InlineEditable>

      {!editing && (
        <div className="mt-2 flex flex-col gap-2">
          <ConfirmDeleteButton
            confirmMessage={`¿Eliminar a "${vendor.name}"?`}
            onConfirm={async () => {
              await deleteVendor(vendor.id, eventId);
              router.refresh();
            }}
          />
          <VendorAttachments
            eventId={eventId}
            vendorId={vendor.id}
            attachments={attachments}
            signedUrlByPath={signedUrlByPath}
          />
        </div>
      )}
    </div>
  );
}
