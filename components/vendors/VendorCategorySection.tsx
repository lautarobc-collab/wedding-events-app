"use client";

import { useState } from "react";
import type { Category, VendorWithAttachments } from "@/lib/types";
import { VendorCard } from "./VendorCard";
import { VendorComparisonTable } from "./VendorComparisonTable";

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
  const [view, setView] = useState<"cards" | "compare">("cards");

  if (vendors.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-medium">{category.name}</h2>
        {vendors.length > 1 && (
          <div className="flex gap-1 text-sm">
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`rounded-full px-3 py-1 ${
                view === "cards"
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setView("compare")}
              className={`rounded-full px-3 py-1 ${
                view === "compare"
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              Comparar
            </button>
          </div>
        )}
      </div>

      {view === "compare" && vendors.length > 1 ? (
        <VendorComparisonTable vendors={vendors} />
      ) : (
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
      )}
    </div>
  );
}
