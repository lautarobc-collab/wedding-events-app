"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/format";
import { useIsDarkMode } from "@/lib/useIsDarkMode";
import type { BudgetItem } from "@/lib/types";

type ChartDatum = {
  month: string;
  label: string;
  actual: number;
};

const MONTH_LABEL = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function BudgetTimelineChart({ items }: { items: BudgetItem[] }) {
  const isDark = useIsDarkMode();

  const totalsByMonth = new Map<string, number>();
  for (const item of items) {
    if (!item.expense_date) continue;
    const month = item.expense_date.slice(0, 7);
    totalsByMonth.set(month, (totalsByMonth.get(month) ?? 0) + item.actual);
  }

  const data: ChartDatum[] = Array.from(totalsByMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, actual]) => {
      const [year, monthIndex] = month.split("-");
      const label = `${MONTH_LABEL[Number(monthIndex) - 1]} ${year}`;
      return { month, label, actual };
    });

  if (data.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <p className="mb-2 text-sm font-medium">Gasto en el tiempo</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ left: 8, right: 16 }}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value: number) => formatMoney(value)} width={70} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Bar dataKey="actual" name="Gastado" fill={isDark ? "#a3a3a3" : "#525252"} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
