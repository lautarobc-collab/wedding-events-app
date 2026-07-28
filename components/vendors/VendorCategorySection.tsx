import type { Category, Vendor, VendorAttachment } from "@/lib/types";
import { VendorCard } from "./VendorCard";

type VendorWithAttachments = Vendor & { vendor_attachments: VendorAttachment[] };

export function VendorCategorySection({
  eventId,
  category,
  vendors,
  signedUrlByPath,
}: {
  eventId: string;
  category: Category;
  vendors: VendorWithAttachments[];
  signedUrlByPath: Map<string, string>;
}) {
  if (vendors.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <h2 className="mb-3 font-medium">{category.name}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            eventId={eventId}
            vendor={vendor}
            attachments={vendor.vendor_attachments}
            signedUrlByPath={signedUrlByPath}
          />
        ))}
      </div>
    </div>
  );
}
