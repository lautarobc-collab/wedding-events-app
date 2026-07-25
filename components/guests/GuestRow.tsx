"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteGuest, updateGuest } from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { guestAttendingStatus } from "@/lib/rsvp";
import { ATTENDING_LABEL, type Guest, type RsvpResponse } from "@/lib/types";
import { guestSchema, type GuestFormValues } from "@/lib/validations/guest";
import { CopyRsvpLinkButton } from "./CopyRsvpLinkButton";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";
import { DietarySelect } from "@/components/DietarySelect";

export function GuestRow({
  eventId,
  slug,
  guest,
}: {
  eventId: string;
  slug: string | null;
  guest: Guest & { rsvp_responses: RsvpResponse[] };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      first_name: guest.first_name,
      last_name: guest.last_name ?? "",
      email: guest.email ?? "",
      invited_by: guest.invited_by ?? "",
      plus_ones: guest.plus_ones,
      children_count: guest.children_count,
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
    setEditing(false);
    router.refresh();
  }

  const attendingStatus = guestAttendingStatus(guest.rsvp_responses);
  const status =
    attendingStatus === "pendiente" ? "Sin responder" : ATTENDING_LABEL[attendingStatus];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-200 px-4 py-3 text-sm">
      <InlineEditable
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onCommit={handleSubmit(onSubmit)}
        className="flex-1"
        display={
          <div>
            <p className="font-medium">
              {guest.first_name} {guest.last_name ?? ""}
            </p>
            <p className="text-neutral-500">
              {status}
              {guest.plus_ones > 0 ? ` · +${guest.plus_ones} acompañantes invitados` : ""}
              {guest.children_count > 0 ? ` (${guest.children_count} niños)` : ""}
              {guest.table_number != null ? ` · Mesa ${guest.table_number}` : ""}
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-2">
          <input
            autoFocus
            placeholder="Nombre"
            {...register("first_name")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            placeholder="Apellidos"
            {...register("last_name")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            placeholder="Email"
            {...register("email")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            placeholder="Invitado por"
            {...register("invited_by")}
            className="rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="number"
            min={0}
            placeholder="Acompañantes"
            {...register("plus_ones", { valueAsNumber: true })}
            className="w-28 rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="number"
            min={0}
            placeholder="De ellos, niños"
            {...register("children_count", { valueAsNumber: true })}
            className="w-28 rounded border border-neutral-300 px-2 py-1"
          />
          <input
            type="number"
            min={0}
            placeholder="Mesa"
            {...register("table_number", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="w-20 rounded border border-neutral-300 px-2 py-1"
          />
          <Controller
            name="dietary_restrictions"
            control={control}
            render={({ field }) => (
              <DietarySelect value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
          {errors.first_name && (
            <p className="text-sm text-red-600">{errors.first_name.message}</p>
          )}
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </form>
      </InlineEditable>

      {!editing && (
        <div className="flex items-center gap-3">
          {slug && <CopyRsvpLinkButton slug={slug} guestId={guest.id} />}
          <ConfirmDeleteButton
            confirmMessage={`¿Eliminar a ${guest.first_name}?`}
            onConfirm={async () => {
              await deleteGuest(guest.id, eventId);
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
