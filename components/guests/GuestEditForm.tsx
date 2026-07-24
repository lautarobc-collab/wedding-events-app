"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateGuest } from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { guestSchema, type GuestFormValues } from "@/lib/validations/guest";
import type { Guest } from "@/lib/types";

export function GuestEditForm({
  eventId,
  guest,
  onDone,
}: {
  eventId: string;
  guest: Guest;
  onDone: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      first_name: guest.first_name,
      last_name: guest.last_name ?? "",
      email: guest.email ?? "",
      invited_by: guest.invited_by ?? "",
      plus_ones: guest.plus_ones,
      dietary_restrictions: guest.dietary_restrictions ?? "",
      table_number: guest.table_number ?? undefined,
    },
  });

  async function onSubmit(values: GuestFormValues) {
    setServerError(null);
    const result = await updateGuest(guest.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded border border-neutral-200 bg-neutral-50 p-4"
    >
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Nombre</label>
          <input
            {...register("first_name")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          {errors.first_name && (
            <p className="text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Apellidos</label>
          <input
            {...register("last_name")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Email</label>
          <input
            {...register("email")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Invitado por</label>
          <input
            {...register("invited_by")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Acompañantes</label>
          <input
            type="number"
            min={0}
            {...register("plus_ones", { valueAsNumber: true })}
            className="w-24 rounded border border-neutral-300 px-2 py-1"
          />
          {errors.plus_ones && (
            <p className="text-sm text-red-600">{errors.plus_ones.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Mesa</label>
          <input
            type="number"
            min={0}
            {...register("table_number", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="w-20 rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">Restricciones alimentarias</label>
          <input
            {...register("dietary_restrictions")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Cancelar
        </button>
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
