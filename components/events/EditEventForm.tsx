"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEvent } from "@/app/(dashboard)/eventos/actions";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import type { Event } from "@/lib/types";

export function EditEventForm({ event }: { event: Event }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.name,
      event_type: event.event_type,
      event_date: event.event_date ?? "",
      total_budget: event.total_budget ?? undefined,
    },
  });

  async function onSubmit(values: EventFormValues) {
    setServerError(null);
    const result = await updateEvent(event.id, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm text-neutral-600 underline"
      >
        Editar evento
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded border border-neutral-200 p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="edit-name"
          {...register("name")}
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="edit-event_type" className="text-sm font-medium">
          Tipo
        </label>
        <select
          id="edit-event_type"
          {...register("event_type")}
          className="rounded border border-neutral-300 px-3 py-2"
        >
          <option value="boda">Boda</option>
          <option value="evento_generico">Evento genérico</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="edit-event_date" className="text-sm font-medium">
          Fecha
        </label>
        <input
          id="edit-event_date"
          type="date"
          {...register("event_date")}
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="edit-total_budget" className="text-sm font-medium">
          Presupuesto total
        </label>
        <input
          id="edit-total_budget"
          type="number"
          step="1"
          {...register("total_budget", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {errors.total_budget && (
          <p className="text-sm text-red-600">{errors.total_budget.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-neutral-300 px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
