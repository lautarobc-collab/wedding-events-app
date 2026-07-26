"use client";

import { useState } from "react";
import { BudgetSummary } from "./BudgetSummary";
import { BudgetChart } from "./BudgetChart";
import { CategoryCard } from "./CategoryCard";
import { NewCategoryForm } from "./NewCategoryForm";
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

  return (
    <>
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
