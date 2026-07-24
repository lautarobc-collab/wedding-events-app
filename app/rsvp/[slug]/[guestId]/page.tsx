import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RsvpForm } from "@/components/rsvp/RsvpForm";
import type { AttendingStatus } from "@/lib/types";

type RsvpInvite = {
  event_id: string;
  event_name: string;
  event_date: string | null;
  guest_id: string;
  first_name: string;
  last_name: string | null;
  invited_plus_ones: number;
  attending: AttendingStatus | null;
  confirmed_plus_ones: number | null;
  dietary_notes: string | null;
  message: string | null;
};

export default async function RsvpPage({
  params,
}: {
  params: Promise<{ slug: string; guestId: string }>;
}) {
  const { slug, guestId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_rsvp_invite", {
    p_slug: slug,
    p_guest_id: guestId,
  });

  const invite = (data as RsvpInvite[] | null)?.[0];
  if (error || !invite) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">{invite.event_name}</h1>
        <p className="text-sm text-neutral-600">
          Hola {invite.first_name}, confírmanos tu asistencia
          {invite.event_date ? ` para el ${invite.event_date}` : ""}.
        </p>
      </div>
      <RsvpForm slug={slug} guestId={guestId} invite={invite} />
    </main>
  );
}
