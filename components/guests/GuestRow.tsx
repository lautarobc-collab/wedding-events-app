"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteGuest,
  setGuestAttending,
  setInvitationStatus,
  updateGuest,
} from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { guestAttendingStatus, guestStatus, GUEST_STATUS_LABEL, type GuestStatus } from "@/lib/rsvp";
import type { Guest, GuestCompanion, RsvpResponse, SeatingTable } from "@/lib/types";
import { guestSchema, type GuestFormValues } from "@/lib/validations/guest";
import { ShareRsvpButton } from "./ShareRsvpButton";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { InlineEditable } from "@/components/InlineEditable";
import { DietarySelect } from "@/components/DietarySelect";
import { CompanionsField } from "./CompanionsField";

const STATUS_STYLES: Record<GuestStatus, string> = {
  por_decidir: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
  invitado: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  si: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  no: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  quizas: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
};

export function GuestRow({
  eventId,
  slug,
  guest,
  tables,
}: {
  eventId: string;
  slug: string | null;
  guest: Guest & { rsvp_responses: RsvpResponse[]; guest_companions: GuestCompanion[] };
  tables: SeatingTable[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    values: {
      first_name: guest.first_name,
      last_name: guest.last_name ?? "",
      email: guest.email ?? "",
      invited_by: guest.invited_by ?? "",
      dietary_restrictions: guest.dietary_restrictions ?? "",
      group_label: guest.group_label ?? "",
      companions: guest.guest_companions.map((companion) => ({
        id: companion.id,
        name: companion.name ?? "",
        is_child: companion.is_child,
        dietary_restrictions: companion.dietary_restrictions ?? "",
      })),
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

  const attending = guestAttendingStatus(guest.rsvp_responses);
  const status = guestStatus(guest.invitation_status, guest.rsvp_responses);
  // Antes de tener una respuesta firme, se puede mover por el ciclo de
  // invitación; en cuanto hay una (propia o registrada a mano), esa manda y
  // el paso de "invitación enviada" deja de tener sentido como opción.
  const statusOptions: GuestStatus[] =
    attending === "pendiente" ? ["por_decidir", "invitado", "si", "no", "quizas"] : ["si", "no", "quizas"];

  async function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as GuestStatus;
    setStatusPending(true);
    const result =
      value === "por_decidir" || value === "invitado"
        ? await setInvitationStatus(guest.id, eventId, value)
        : await setGuestAttending(guest.id, eventId, value);
    setStatusPending(false);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    router.refresh();
  }

  const childrenCount = guest.guest_companions.filter((c) => c.is_child).length;
  const table = tables.find((t) => t.id === guest.table_id);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-sm">
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
              {guest.group_label && (
                <span className="ml-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-normal text-neutral-600 dark:text-neutral-400">
                  {guest.group_label}
                </span>
              )}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              {guest.guest_companions.length > 0
                ? `+${guest.guest_companions.length} acompañantes invitados`
                : ""}
              {childrenCount > 0 ? ` (${childrenCount} niños)` : ""}
              {table ? ` · Mesa: ${table.name}` : ""}
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              autoFocus
              placeholder="Nombre"
              {...register("first_name")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              placeholder="Apellidos"
              {...register("last_name")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              placeholder="Email"
              {...register("email")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              placeholder="Invitado por"
              {...register("invited_by")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
            <input
              placeholder="Grupo (familia, amigos...)"
              {...register("group_label")}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
            />
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

          {errors.first_name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name.message}</p>
          )}
          {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}
        </form>
      </InlineEditable>

      {!editing && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}
          <select
            value={status}
            disabled={statusPending}
            onChange={handleStatusChange}
            className={`rounded-full border-0 px-2 py-1 text-xs font-medium disabled:opacity-50 ${STATUS_STYLES[status]}`}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {GUEST_STATUS_LABEL[option]}
              </option>
            ))}
          </select>
          {slug && (
            <ShareRsvpButton
              slug={slug}
              guestId={guest.id}
              guestName={guest.first_name}
            />
          )}
          <ConfirmDeleteButton
            confirmMessage={`¿Eliminar a ${guest.first_name}?`}
            onConfirm={async () => {
              const result = await deleteGuest(guest.id, eventId);
              if (result?.error) {
                setServerError(result.error);
                return;
              }
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
