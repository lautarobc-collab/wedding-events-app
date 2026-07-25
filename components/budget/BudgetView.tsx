"use client";

import { useState } from "react";
import { BudgetSummary } from "./BudgetSummary";
import { BudgetChart } from "./BudgetChart";
import { CategoryCard } from "./CategoryCard";
import { NewCategoryForm } from "./NewCategoryForm";
import type { BudgetItem, Category, Event } from "@/lib/types";

export function BudgetView({
  eventId,
  totalBudget,
  categories,
  items,
}: {
  eventId: string;
  totalBudget: Event["total_budget"];
  categories: Category[];
  items: BudgetItem[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const visibleCategories = selectedCategoryId
    ? categories.filter((category) => category.id === selectedCategoryId)
    : categories;

  return (
    <>
      <BudgetSummary totalBudget={totalBudget} items={items} />

      <BudgetChart
        categories={categories}
        items={items}
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
          />
        ))}
      </div>

      <NewCategoryForm eventId={eventId} nextSortOrder={categories.length} />
    </>
  );
}
