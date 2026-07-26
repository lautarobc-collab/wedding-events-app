"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GUEST_STATUS_LABEL, type GuestStatus } from "@/lib/rsvp";

const COLORS: Record<GuestStatus, string> = {
  por_decidir: "#a3a3a3",
  invitado: "#2563eb",
  si: "#16a34a",
  no: "#dc2626",
  quizas: "#ca8a04",
};

const ORDER: GuestStatus[] = ["por_decidir", "invitado", "si", "quizas", "no"];

export function GuestChart({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<GuestStatus, number>;
  selected: GuestStatus | null;
  onSelect: (value: GuestStatus | null) => void;
}) {
  const data = ORDER.map((key) => ({ key, name: GUEST_STATUS_LABEL[key], value: counts[key] })).filter(
    (datum) => datum.value > 0,
  );

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
              const key = (bar.payload as { key: GuestStatus } | undefined)?.key;
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
