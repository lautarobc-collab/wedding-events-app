"use client";

import { useState } from "react";
import { VendorCategorySection } from "./VendorCategorySection";
import { VendorDirectory } from "./VendorDirectory";
import { ArchivedVendorsSection } from "./ArchivedVendorsSection";
import { NewVendorForm } from "./NewVendorForm";
import type { Category, VendorWithAttachments } from "@/lib/types";

type CategoryWithVendors = Category & { vendors: VendorWithAttachments[] };

export function ProveedoresView({
  eventId,
  categories,
  totalsByCategory,
  signedUrlByPath,
}: {
  eventId: string;
  categories: CategoryWithVendors[];
  totalsByCategory: Map<string, number>;
  signedUrlByPath: Map<string, string>;
}) {
  const [view, setView] = useState<"categoria" | "directorio">("categoria");

  const activeCategories = categories.map((category) => ({
    ...category,
    vendors: category.vendors.filter((vendor) => !vendor.archived),
  }));
  const archivedVendors = categories.flatMap((category) =>
    category.vendors
      .filter((vendor) => vendor.archived)
      .map((vendor) => ({ vendor, categoryName: category.name })),
  );
  const activeVendorsFlat = activeCategories.flatMap((category) =>
    category.vendors.map((vendor) => ({ vendor, categoryName: category.name })),
  );
  const hasVendors = activeCategories.some((category) => category.vendors.length > 0);

  return (
    <>
      <NewVendorForm eventId={eventId} categories={categories} />

      {hasVendors && (
        <div className="flex gap-1 text-sm">
          <button
            type="button"
            onClick={() => setView("categoria")}
            className={`rounded-full px-3 py-1 ${
              view === "categoria"
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                : "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            Por categoría
          </button>
          <button
            type="button"
            onClick={() => setView("directorio")}
            className={`rounded-full px-3 py-1 ${
              view === "directorio"
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                : "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            Directorio
          </button>
        </div>
      )}

      {view === "categoria" ? (
        <div className="flex flex-col gap-4">
          {activeCategories.map((category) => (
            <VendorCategorySection
              key={category.id}
              eventId={eventId}
              category={category}
              vendors={category.vendors}
              signedUrlByPath={signedUrlByPath}
            />
          ))}
          {categories.length > 0 && !hasVendors && (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Todavía no añadiste ningún proveedor.
            </p>
          )}
        </div>
      ) : (
        <VendorDirectory
          eventId={eventId}
          categories={categories}
          totalsByCategory={totalsByCategory}
          vendors={activeVendorsFlat}
          signedUrlByPath={signedUrlByPath}
        />
      )}

      <ArchivedVendorsSection eventId={eventId} items={archivedVendors} signedUrlByPath={signedUrlByPath} />
    </>
  );
}
