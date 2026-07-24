import type { EventType } from "@/lib/types";

export const DEFAULT_CATEGORIES: Record<EventType, string[]> = {
  boda: [
    "Tareas",
    "Organización",
    "Programación del día",
    "Lugar de celebración",
    "Hotel",
    "Trajes",
    "Peluquería y maquillaje",
    "Flores",
    "Tarta nupcial",
    "Servicio de catering",
    "Fotografía",
    "Vídeo",
    "Animación y música",
    "Invitaciones",
    "Regalos",
  ],
  evento_generico: [
    "Lugar de celebración",
    "Catering",
    "Decoración",
    "Fotografía",
    "Animación/Música",
    "Invitaciones",
    "Varios",
  ],
};
