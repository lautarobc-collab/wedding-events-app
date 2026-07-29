"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitRsvp } from "@/app/rsvp/[slug]/[guestId]/actions";
import { rsvpSchema, type RsvpFormValues } from "@/lib/validations/rsvp";
import type { AttendingStatus } from "@/lib/types";
import { DietarySelect } from "@/components/DietarySelect";

type Invite = {
  invited_plus_ones: number;
  invited_children: number;
  attending: AttendingStatus | null;
  confirmed_plus_ones: number | null;
  confirmed_children: number | null;
  dietary_notes: string | null;
  message: string | null;
};

type Companion = {
  id: string;
  is_child: boolean;
  name: string | null;
};

export function RsvpForm({
  slug,
  guestId,
  invite,
  companions,
}: {
  slug: string;
  guestId: string;
  invite: Invite;
  companions: Companion[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      attending: invite.attending ?? undefined,
      confirmed_plus_ones: invite.confirmed_plus_ones ?? 0,
      confirmed_children: invite.confirmed_children ?? 0,
      dietary_notes: invite.dietary_notes ?? "",
      message: invite.message ?? "",
      companion_names: companions.map((companion) => ({
        id: companion.id,
        name: companion.name ?? "",
      })),
    },
  });

  const attending = watch("attending");

  async function onSubmit(values: RsvpFormValues) {
    setServerError(null);
    const result = await submitRsvp(slug, guestId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded border border-neutral-200 dark:border-neutral-800 p-4 text-sm">
        ¡Gracias! Tu respuesta se guardó correctamente.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">¿Asistirás?</label>
        <select
          {...register("attending")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        >
          <option value="" disabled>
            Elige una opción
          </option>
          <option value="si">Sí, allí estaré</option>
          <option value="no">No podré ir</option>
          <option value="quizas">Todavía no lo sé</option>
        </select>
        {errors.attending && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.attending.message}</p>
        )}
      </div>

      {attending === "si" && invite.invited_plus_ones > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Acompañantes (máximo {invite.invited_plus_ones})
          </label>
          <input
            type="number"
            min={0}
            max={invite.invited_plus_ones}
            {...register("confirmed_plus_ones", { valueAsNumber: true })}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          />
        </div>
      )}

      {attending === "si" && invite.invited_children > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            De esos acompañantes, ¿cuántos son niños? (máximo {invite.invited_children})
          </label>
          <input
            type="number"
            min={0}
            max={invite.invited_children}
            {...register("confirmed_children", { valueAsNumber: true })}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          />
          {errors.confirmed_children && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmed_children.message}</p>
          )}
        </div>
      )}

      {attending === "si" && companions.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Nombres de tus acompañantes (opcional)
          </label>
          {companions.map((companion, index) => (
            <div key={companion.id} className="flex items-center gap-2">
              <input type="hidden" {...register(`companion_names.${index}.id` as const)} />
              <input
                placeholder={companion.is_child ? "Nombre (niño)" : "Nombre"}
                {...register(`companion_names.${index}.name` as const)}
                className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
              />
            </div>
          ))}
        </div>
      )}

      {attending === "si" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Restricciones alimentarias (opcional)
          </label>
          <Controller
            name="dietary_notes"
            control={control}
            render={({ field }) => (
              <DietarySelect value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Mensaje (opcional)</label>
        <textarea
          {...register("message")}
          rows={3}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        />
      </div>

      {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-white dark:text-neutral-900 disabled:opacity-50"
      >
        {isSubmitting ? "Enviando..." : "Confirmar respuesta"}
      </button>
    </form>
  );
}
