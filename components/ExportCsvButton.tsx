"use client";

import { downloadCsv } from "@/lib/exportCsv";

export function ExportCsvButton({
  filename,
  csv,
  label = "Exportar CSV",
}: {
  filename: string;
  csv: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, csv)}
      className="self-start rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600"
    >
      {label}
    </button>
  );
}
