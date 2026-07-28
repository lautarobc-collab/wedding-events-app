"use client";

import { useState } from "react";
import { BudgetSummary } from "./BudgetSummary";
import { BudgetChart } from "./BudgetChart";
import { CategoryCard } from "./CategoryCard";
import { NewCategoryForm } from "./NewCategoryForm";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { toCsv } from "@/lib/exportCsv";
import type { BudgetItem, Category, Event, Vendor } from "@/lib/types";

export function BudgetView({
  eventId,
  totalBudget,
  categories,
  items,
  vendors,
  chosenVendors,
}: {
  eventId: string;
  totalBudget: Event["total_budget"];
  categories: Category[];
  items: BudgetItem[];
  vendors: Vendor[];
  chosenVendors: Vendor[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const visibleCategories = selectedCategoryId
    ? categories.filter((category) => category.id === selectedCategoryId)
    : categories;

  const categoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? "";

  type ExportRow = {
    category: string;
    description: string;
    estimated: number | null;
    actual: number | null;
    vendor: string | null;
  };

  const exportRows: ExportRow[] = [
    ...items.map((item) => ({
      category: categoryName(item.category_id),
      description: item.description,
      estimated: item.estimated,
      actual: item.actual,
      vendor: vendors.find((v) => v.id === item.vendor_id)?.name ?? null,
    })),
    ...chosenVendors.map((vendor) => ({
      category: categoryName(vendor.category_id),
      description: `${vendor.name} (proveedor elegido)`,
      estimated: vendor.estimated,
      actual: vendor.actual,
      vendor: vendor.name,
    })),
  ];

  const csv = toCsv(exportRows, [
    { label: "Categoría", value: (r) => r.category },
    { label: "Descripción", value: (r) => r.description },
    { label: "Estimado", value: (r) => r.estimated },
    { label: "Real", value: (r) => r.actual },
    { label: "Proveedor", value: (r) => r.vendor },
  ]);

  return (
    <>
      <ExportCsvButton filename="presupuesto.csv" csv={csv} />
      <BudgetSummary totalBudget={totalBudget} items={items} chosenVendors={chosenVendors} />

      <BudgetChart
        categories={categories}
        items={items}
        chosenVendors={chosenVendors}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <div className="flex flex-col gap-4">
        {visibleCategories.map((category) => (
          <CategoryCard
            key={category.id}
            eventId={eventId}
            category={category}
            items={items.filter((item) => item.category_id === category.id)}
            vendors={vendors.filter((vendor) => vendor.category_id === category.id)}
            chosenVendors={chosenVendors.filter(
              (vendor) => vendor.category_id === category.id,
            )}
          />
        ))}
      </div>

      <NewCategoryForm eventId={eventId} categories={categories} />
    </>
  );
}
