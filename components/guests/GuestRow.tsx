"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGuest } from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { latestRsvp } from "@/lib/rsvp";
import { ATTENDING_LABEL, type Guest, type RsvpResponse } from "@/lib/types";
import { GuestEditForm } from "./GuestEditForm";
import { CopyRsvpLinkButton } from "./CopyRsvpLinkButton";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

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

  if (editing) {
    return (
      <GuestEditForm eventId={eventId} guest={guest} onDone={() => setEditing(false)} />
    );
  }

  const latest = latestRsvp(guest.rsvp_responses);
  const status = latest?.attending ? ATTENDING_LABEL[latest.attending] : "Sin responder";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-200 px-4 py-3 text-sm">
      <div>
        <p className="font-medium">
          {guest.first_name} {guest.last_name ?? ""}
        </p>
        <p className="text-neutral-500">
          {status}
          {guest.plus_ones > 0 ? ` · +${guest.plus_ones} acompañantes invitados` : ""}
          {guest.table_number != null ? ` · Mesa ${guest.table_number}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {slug && <CopyRsvpLinkButton slug={slug} guestId={guest.id} />}
        <button type="button" onClick={() => setEditing(true)} className="underline">
          Editar
        </button>
        <ConfirmDeleteButton
          confirmMessage={`¿Eliminar a ${guest.first_name}?`}
          onConfirm={async () => {
            await deleteGuest(guest.id, eventId);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
