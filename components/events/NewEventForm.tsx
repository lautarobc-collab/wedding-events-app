"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent } from "@/app/(dashboard)/eventos/actions";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";

export function NewEventForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { event_type: "boda" },
  });

  async function onSubmit(values: EventFormValues) {
    setServerError(null);
    const result = await createEvent(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({ name: "", event_type: "boda", event_date: "", total_budget: undefined });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <h2 className="font-medium">Nuevo evento</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          {...register("name")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        />
        {errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event_type" className="text-sm font-medium">
          Tipo
        </label>
        <select
          id="event_type"
          {...register("event_type")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        >
          <option value="boda">Boda</option>
          <option value="evento_generico">Evento genérico</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event_date" className="text-sm font-medium">
          Fecha (opcional)
        </label>
        <input
          id="event_date"
          type="date"
          {...register("event_date")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="total_budget" className="text-sm font-medium">
          Presupuesto total (opcional)
        </label>
        <input
          id="total_budget"
          type="number"
          step="1"
          {...register("total_budget", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        />
        {errors.total_budget && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.total_budget.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-white dark:text-neutral-900 disabled:opacity-50"
      >
        {isSubmitting ? "Creando..." : "Crear evento"}
      </button>
    </form>
  );
}
