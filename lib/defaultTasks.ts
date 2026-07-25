import type { EventType } from "@/lib/types";

type DefaultTaskTemplate = {
  title: string;
  monthsBefore: number;
};

// Antelación orientativa por tipo de evento, inspirada en el patrón habitual
// del sector (líneas de tiempo de 12-1 meses antes) — texto 100% propio.
const DEFAULT_TASKS: Record<EventType, DefaultTaskTemplate[]> = {
  boda: [
    { title: "Fijar la fecha y el presupuesto orientativo", monthsBefore: 12 },
    { title: "Reservar el lugar de celebración", monthsBefore: 12 },
    { title: "Empezar la lista de invitados", monthsBefore: 11 },
    { title: "Contratar catering y fotografía", monthsBefore: 9 },
    { title: "Elegir el traje o el vestido", monthsBefore: 8 },
    { title: "Reservar música o animación", monthsBefore: 6 },
    { title: "Enviar las invitaciones", monthsBefore: 5 },
    { title: "Organizar el viaje de luna de miel", monthsBefore: 4 },
    { title: "Confirmar proveedores y menú definitivo", monthsBefore: 2 },
    { title: "Cerrar la lista definitiva de invitados", monthsBefore: 1 },
    { title: "Prueba de peluquería y maquillaje", monthsBefore: 1 },
    { title: "Recoger el traje o el vestido", monthsBefore: 0 },
    { title: "Preparar los pagos finales a proveedores", monthsBefore: 0 },
  ],
  evento_generico: [
    { title: "Fijar la fecha y el presupuesto orientativo", monthsBefore: 6 },
    { title: "Reservar el lugar de celebración", monthsBefore: 5 },
    { title: "Contratar catering", monthsBefore: 4 },
    { title: "Enviar las invitaciones", monthsBefore: 2 },
    { title: "Confirmar proveedores y menú definitivo", monthsBefore: 1 },
    { title: "Cerrar la lista definitiva de invitados", monthsBefore: 0 },
  ],
};

// date.setMonth() puede "desbordar" al mes siguiente si el día original no
// existe en el mes de destino (ej. 31 de marzo menos 1 mes daría 3 de abril
// en vez de 28/29 de febrero). Se fija el día a 1 antes de cambiar de mes, y
// luego se recorta al último día real de ese mes.
function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() - months);
  const daysInTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, daysInTargetMonth));
  return result;
}

export function buildDefaultTasks(eventType: EventType, eventDate: string | null) {
  return DEFAULT_TASKS[eventType].map((template) => {
    let due_date: string | null = null;
    if (eventDate) {
      const date = subtractMonths(new Date(`${eventDate}T00:00:00`), template.monthsBefore);
      due_date = date.toISOString().slice(0, 10);
    }
    return {
      title: template.title,
      due_date,
      status: "sin_empezar" as const,
      notes: null as string | null,
    };
  });
}
