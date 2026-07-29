"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  toggleThankYouSent,
  updateGiftDescription,
} from "@/app/(dashboard)/eventos/[id]/invitados/actions";
import { giftSchema, type GiftFormValues } from "@/lib/validations/gift";
import { InlineEditable } from "@/components/InlineEditable";
import type { Guest } from "@/lib/types";

type GuestGift = Pick<Guest, "id" | "first_name" | "last_name" | "gift_description" | "thank_you_sent">;

export function GiftRow({ eventId, guest }: { eventId: string; guest: GuestGift }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
  } = useForm<GiftFormValues>({
    resolver: zodResolver(giftSchema),
    defaultValues: { gift_description: guest.gift_description ?? "" },
  });

  async function onSubmit(values: GiftFormValues) {
    await updateGiftDescription(guest.id, eventId, values);
    setEditing(false);
    router.refresh();
  }

  async function handleToggleThanked() {
    setPending(true);
    await toggleThankYouSent(guest.id, eventId, !guest.thank_you_sent);
    setPending(false);
    router.refresh();
  }

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
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              {guest.gift_description || "Sin regalo registrado"}
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            autoFocus
            placeholder="Describe el regalo"
            {...register("gift_description")}
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1"
          />
        </form>
      </InlineEditable>

      {!editing && (
        <label className="flex shrink-0 items-center gap-2">
          <input
            type="checkbox"
            checked={guest.thank_you_sent}
            disabled={pending}
            onChange={handleToggleThanked}
          />
          Agradecido
        </label>
      )}
    </div>
  );
}
