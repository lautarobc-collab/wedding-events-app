import { formatMoney } from "@/lib/format";
import type { Category, VendorWithAttachments } from "@/lib/types";
import { VendorCard } from "./VendorCard";

export function VendorDirectory({
  eventId,
  categories,
  totalsByCategory,
  vendors,
  signedUrlByPath,
}: {
  eventId: string;
  categories: Category[];
  totalsByCategory: Map<string, number>;
  vendors: { vendor: VendorWithAttachments; categoryName: string }[];
  signedUrlByPath: Map<string, string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
          >
            <p className="text-neutral-500 dark:text-neutral-400">{category.name}</p>
            <p className="font-medium">{formatMoney(totalsByCategory.get(category.id) ?? 0)}</p>
          </div>
        ))}
      </div>

      {vendors.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Todavía no añadiste ningún proveedor.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map(({ vendor, categoryName }) => (
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
      )}
    </div>
  );
}
