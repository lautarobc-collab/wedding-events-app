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
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
  } = useForm<GiftFormValues>({
    resolver: zodResolver(giftSchema),
    values: { gift_description: guest.gift_description ?? "" },
  });

  async function onSubmit(values: GiftFormValues) {
    setServerError(null);
    const result = await updateGiftDescription(guest.id, eventId, values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleToggleThanked() {
    setServerError(null);
    setPending(true);
    const result = await toggleThankYouSent(guest.id, eventId, !guest.thank_you_sent);
    setPending(false);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
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
        <div className="flex shrink-0 flex-col items-end gap-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={guest.thank_you_sent}
              disabled={pending}
              onChange={handleToggleThanked}
            />
            Agradecido
          </label>
          {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}
        </div>
      )}
    </div>
  );
}
