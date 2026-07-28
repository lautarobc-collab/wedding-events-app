"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GUEST_STATUS_LABEL, type GuestStatus } from "@/lib/rsvp";
import { useIsDarkMode } from "@/lib/useIsDarkMode";

const COLORS: Record<GuestStatus, string> = {
  por_decidir: "#a3a3a3",
  invitado: "#2563eb",
  si: "#16a34a",
  no: "#dc2626",
  quizas: "#ca8a04",
};

const DARK_COLORS: Record<GuestStatus, string> = {
  por_decidir: "#8a8a8a",
  invitado: "#60a5fa",
  si: "#4ade80",
  no: "#f87171",
  quizas: "#facc15",
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
  const isDark = useIsDarkMode();
  const palette = isDark ? DARK_COLORS : COLORS;

  if (data.length === 0) return null;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
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
                fill={palette[datum.key]}
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
          className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 underline"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
