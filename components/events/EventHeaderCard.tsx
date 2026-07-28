"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEvent } from "@/app/(dashboard)/eventos/actions";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import { EVENT_TYPE_LABEL, type Event } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { InlineEditable } from "@/components/InlineEditable";

function daysUntil(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${eventDate}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function EventHeaderCard({ event }: { event: Event }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
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
    setEditing(false);
    router.refresh();
  }

  const countdown = event.event_date ? daysUntil(event.event_date) : null;
  const countdownLabel =
    countdown == null
      ? null
      : countdown > 0
        ? `Faltan ${countdown} días`
        : countdown === 0
          ? "¡Es hoy!"
          : null;

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <InlineEditable
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onCommit={handleSubmit(onSubmit)}
        display={
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-xl font-semibold">{event.name}</h1>
              {countdownLabel && (
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{countdownLabel}</span>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Tipo</dt>
                <dd className="font-medium">{EVENT_TYPE_LABEL[event.event_type]}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Fecha</dt>
                <dd className="font-medium">{event.event_date ?? "Sin definir"}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Presupuesto</dt>
                <dd className="font-medium">
                  {event.total_budget != null ? formatMoney(event.total_budget) : "Sin definir"}
                </dd>
              </div>
            </dl>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="edit-name"
              autoFocus
              {...register("name")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
            />
            {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-event_type" className="text-sm font-medium">
                Tipo
              </label>
              <select
                id="edit-event_type"
                {...register("event_type")}
                className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
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
                className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
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
                className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
              />
              {errors.total_budget && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.total_budget.message}</p>
              )}
            </div>
          </div>

          {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}
        </form>
      </InlineEditable>
    </div>
  );
}
