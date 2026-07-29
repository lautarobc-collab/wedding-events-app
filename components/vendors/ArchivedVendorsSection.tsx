import type { Vendor, VendorAttachment } from "@/lib/types";
import { VendorCard } from "./VendorCard";

type VendorWithAttachments = Vendor & { vendor_attachments: VendorAttachment[] };

export function ArchivedVendorsSection({
  eventId,
  items,
  signedUrlByPath,
}: {
  eventId: string;
  items: { vendor: VendorWithAttachments; categoryName: string }[];
  signedUrlByPath: Map<string, string>;
}) {
  if (items.length === 0) return null;

  return (
    <details className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <summary className="cursor-pointer font-medium text-neutral-600 dark:text-neutral-400">
        Proveedores archivados ({items.length})
      </summary>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ vendor, categoryName }) => (
          <div key={vendor.id} className="flex flex-col gap-1">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">{categoryName}</p>
            <VendorCard
              eventId={eventId}
              vendor={vendor}
              attachments={vendor.vendor_attachments}
              signedUrlByPath={signedUrlByPath}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
