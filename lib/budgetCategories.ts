import type { EventType } from "@/lib/types";

// Categorías habituales de presupuesto, para ofrecer un punto de partida
// cerrado en vez de texto libre y evitar duplicados como "Flores" / "flores"
// / "Floristería" conviviendo como categorías distintas. "Otros" (en
// NewCategoryForm) sigue permitiendo cualquier nombre fuera de esta lista.
// Separadas por tipo de evento porque las de boda (anillos, luna de miel...)
// no tienen sentido como sugerencia en un evento genérico.
const CANONICAL_BUDGET_CATEGORIES_BODA = [
  "Lugar y catering",
  "Fotografía y vídeo",
  "Música y entretenimiento",
  "Flores y decoración",
  "Vestuario y belleza",
  "Papelería e invitaciones",
  "Transporte",
  "Alojamiento",
  "Pastel",
  "Anillos",
  "Luna de miel",
  "Regalos y detalles",
  "Oficiante y ceremonia",
] as const;

const CANONICAL_BUDGET_CATEGORIES_GENERICO = [
  "Lugar de celebración",
  "Catering",
  "Decoración",
  "Fotografía",
  "Animación y música",
  "Invitaciones",
  "Varios",
] as const;

export function getCanonicalCategories(eventType: EventType): readonly string[] {
  return eventType === "boda"
    ? CANONICAL_BUDGET_CATEGORIES_BODA
    : CANONICAL_BUDGET_CATEGORIES_GENERICO;
}
