import type { AttendingStatus, InvitationStatus, RsvpResponse } from "@/lib/types";

export function latestRsvp(responses: RsvpResponse[]): RsvpResponse | null {
  if (!responses.length) return null;
  return [...responses].sort(
    (a, b) => new Date(b.responded_at).getTime() - new Date(a.responded_at).getTime(),
  )[0];
}

export function guestAttendingStatus(responses: RsvpResponse[]): AttendingStatus | "pendiente" {
  return latestRsvp(responses)?.attending ?? "pendiente";
}

export type GuestStatus = InvitationStatus | AttendingStatus;

export const GUEST_STATUS_LABEL: Record<GuestStatus, string> = {
  por_decidir: "Por decidir",
  invitado: "Invitación enviada",
  si: "Confirmado",
  no: "No asiste",
  quizas: "Tal vez",
};

// Estado único de cara al anfitrión: si ya hay una respuesta firme (sí/no/tal
// vez, propia o registrada a mano), esa manda; si no, se muestra en qué punto
// del ciclo de invitación está.
export function guestStatus(
  invitationStatus: InvitationStatus,
  responses: RsvpResponse[],
): GuestStatus {
  const attending = guestAttendingStatus(responses);
  return attending === "pendiente" ? invitationStatus : attending;
}
