"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGuest } from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { guestSchema, type GuestFormValues } from "@/lib/validations/guest";
import { DietarySelect } from "@/components/DietarySelect";
import { CompanionsField } from "./CompanionsField";

export function NewGuestForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: { dietary_restrictions: "", companions: [] },
  });

  async function onSubmit(values: GuestFormValues) {
    setServerError(null);
    const result = await createGuest(eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset({
      first_name: "",
      last_name: "",
      email: "",
      invited_by: "",
      dietary_restrictions: "",
      table_number: undefined,
      companions: [],
    });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded border border-neutral-200 p-4"
    >
      <h2 className="font-medium">Nuevo invitado</h2>
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm">Restricciones alimentarias (invitado principal)</label>
        <Controller
          name="dietary_restrictions"
          control={control}
          render={({ field }) => (
            <DietarySelect value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
      </div>

      <CompanionsField control={control} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Añadiendo..." : "Añadir invitado"}
      </button>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
    </form>
  );
}
