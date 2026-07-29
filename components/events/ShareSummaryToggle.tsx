"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSummarySharing } from "@/app/(dashboard)/eventos/actions";

export function ShareSummaryToggle({
  eventId,
  summaryPublicToken,
}: {
  eventId: string;
  summaryPublicToken: string | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = summaryPublicToken != null;
  const url =
    enabled && typeof window !== "undefined"
      ? `${window.location.origin}/resumen/${summaryPublicToken}`
      : "";

  async function handleToggle() {
    setError(null);
    setIsSubmitting(true);
    const result = await setSummarySharing(eventId, !enabled);
    setIsSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">Resumen compartible</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Enlace público de solo lectura con los números generales (sin nombres ni datos
            personales), para familiares o tu pareja.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className="shrink-0 rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {enabled ? "Desactivar" : "Activar"}
        </button>
      </div>

      {enabled && url && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-1">{url}</code>
          <button type="button" onClick={handleCopy} className="underline">
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
