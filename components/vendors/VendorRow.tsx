"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVendor } from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { formatMoney } from "@/lib/format";
import { VENDOR_STATUS_LABEL, type Vendor } from "@/lib/types";
import { VendorEditForm } from "./VendorEditForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export function VendorRow({ eventId, vendor }: { eventId: string; vendor: Vendor }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <VendorEditForm eventId={eventId} vendor={vendor} onDone={() => setEditing(false)} />
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2 text-sm">
      <div>
        <p className="font-medium">{vendor.name}</p>
        <p className="text-neutral-500">
          {VENDOR_STATUS_LABEL[vendor.status]}
          {vendor.price != null ? ` · ${formatMoney(vendor.price)}` : ""}
          {vendor.contact_phone ? ` · ${vendor.contact_phone}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setEditing(true)} className="underline">
          Editar
        </button>
        <ConfirmDeleteButton
          confirmMessage={`¿Eliminar a "${vendor.name}"?`}
          onConfirm={async () => {
            await deleteVendor(vendor.id, eventId);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
