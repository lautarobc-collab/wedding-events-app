export type CsvColumn<T> = { label: string; value: (row: T) => string | number | null | undefined };

function escapeCsvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCsvCell(col.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.value(row))).join(","),
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM para que Excel detecte UTF-8 y no rompa las tildes/eñes.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
