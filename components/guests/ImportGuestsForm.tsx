"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { importGuests } from "@/app/(dashboard)/eventos/[id]/invitados/actions";

export function ImportGuestsForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm text-neutral-600 underline"
      >
        + Importar invitados desde CSV
      </button>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setMessage(null);
    const result = await importGuests(eventId, text);
    setIsSubmitting(false);

    if (!result.ok) {
      setMessage({ text: result.error, isError: true });
      return;
    }

    const skippedNote = result.skipped > 0 ? ` (${result.skipped} filas vacías ignoradas)` : "";
    setMessage({
      text: `Se importaron ${result.imported} invitados${skippedNote}.`,
      isError: false,
    });
    setText("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded border border-neutral-200 p-4"
    >
      <h2 className="font-medium">Importar invitados desde CSV</h2>
      <p className="text-sm text-neutral-500">
        Pega una fila por invitado: Nombre;Apellidos;Email;Invitado por (también
        vale separado por comas). Solo el nombre es obligatorio.
      </p>
      <textarea
        autoFocus
        rows={6}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={"Ana García;;ana@email.com;María\nLuis Pérez;;;Juan"}
        className="rounded border border-neutral-300 px-2 py-1 font-mono text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="self-start rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Importando..." : "Importar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMessage(null);
          }}
          className="text-sm text-neutral-500 underline"
        >
          Cancelar
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.isError ? "text-red-600" : "text-neutral-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
