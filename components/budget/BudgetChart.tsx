"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";
import { sumBudget } from "@/lib/budget";
import { useIsDarkMode } from "@/lib/useIsDarkMode";
import type { BudgetItem, Category, Vendor } from "@/lib/types";

type ChartDatum = {
  id: string;
  name: string;
  estimated: number;
  actual: number;
};

export function BudgetChart({
  categories,
  items,
  chosenVendors,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: Category[];
  items: BudgetItem[];
  chosenVendors: Vendor[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  const data: ChartDatum[] = categories
    .map((category) => {
      const categoryItems = items.filter((item) => item.category_id === category.id);
      const categoryVendors = chosenVendors.filter(
        (vendor) => vendor.category_id === category.id,
      );
      const { estimated, actual } = sumBudget(categoryItems, categoryVendors);
      return { id: category.id, name: category.name, estimated, actual };
    })
    .filter((datum) => datum.estimated > 0 || datum.actual > 0);
  const isDark = useIsDarkMode();

  if (data.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <p className="mb-2 text-sm font-medium">Gasto por categoría</p>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" tickFormatter={(value: number) => formatMoney(value)} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Bar
            dataKey="estimated"
            name="Estimado"
            fill={isDark ? "#404040" : "#e5e5e5"}
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="actual"
            name="Gastado"
            radius={[0, 4, 4, 0]}
            className="cursor-pointer"
            onClick={(bar) => {
              const id = (bar.payload as ChartDatum | undefined)?.id;
              if (!id) return;
              onSelectCategory(id === selectedCategoryId ? null : id);
            }}
          >
            {data.map((datum) => (
              <Cell
                key={datum.id}
                fill={
                  datum.id === selectedCategoryId
                    ? isDark
                      ? "#f5f5f5"
                      : "#171717"
                    : isDark
                      ? "#a3a3a3"
                      : "#525252"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {selectedCategoryId && (
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 underline"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
