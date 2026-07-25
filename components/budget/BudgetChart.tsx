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
import type { BudgetItem, Category } from "@/lib/types";

type ChartDatum = {
  id: string;
  name: string;
  estimated: number;
  actual: number;
};

export function BudgetChart({
  categories,
  items,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: Category[];
  items: BudgetItem[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  const data: ChartDatum[] = categories
    .map((category) => {
      const categoryItems = items.filter((item) => item.category_id === category.id);
      return {
        id: category.id,
        name: category.name,
        estimated: categoryItems.reduce((sum, item) => sum + item.estimated, 0),
        actual: categoryItems.reduce((sum, item) => sum + item.actual, 0),
      };
    })
    .filter((datum) => datum.estimated > 0 || datum.actual > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 p-4">
      <p className="mb-2 text-sm font-medium">Gasto por categoría</p>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" tickFormatter={(value: number) => formatMoney(value)} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Bar dataKey="estimated" name="Estimado" fill="#e5e5e5" radius={[0, 4, 4, 0]} />
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
              <Cell key={datum.id} fill={datum.id === selectedCategoryId ? "#171717" : "#525252"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {selectedCategoryId && (
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className="mt-2 text-sm text-neutral-600 underline"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
