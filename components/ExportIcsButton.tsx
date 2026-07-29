"use client";

import { downloadIcs } from "@/lib/ics";

export function ExportIcsButton({
  filename,
  content,
  label = "Exportar calendario (.ics)",
}: {
  filename: string;
  content: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadIcs(filename, content)}
      className="self-start rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600"
    >
      {label}
    </button>
  );
}
