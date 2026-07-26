"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AttendingStatus } from "@/lib/types";

type FilterValue = AttendingStatus | "pendiente";

const COLORS: Record<FilterValue, string> = {
  si: "#16a34a",
  no: "#dc2626",
  quizas: "#ca8a04",
  pendiente: "#a3a3a3",
};

const LABELS: Record<FilterValue, string> = {
  si: "Confirmado",
  no: "No asiste",
  quizas: "Quizás",
  pendiente: "Sin responder",
};

export function GuestChart({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<FilterValue, number>;
  selected: FilterValue | null;
  onSelect: (value: FilterValue | null) => void;
}) {
  const data = (Object.keys(LABELS) as FilterValue[])
    .map((key) => ({ key, name: LABELS[key], value: counts[key] }))
    .filter((datum) => datum.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 p-4">
      <p className="mb-2 text-sm font-medium">Invitados por estado</p>
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            className="cursor-pointer"
            onClick={(bar) => {
              const key = (bar.payload as { key: FilterValue } | undefined)?.key;
              if (!key) return;
              onSelect(key === selected ? null : key);
            }}
          >
            {data.map((datum) => (
              <Cell
                key={datum.key}
                fill={COLORS[datum.key]}
                opacity={selected && selected !== datum.key ? 0.4 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {selected && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-2 text-sm text-neutral-600 underline"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
