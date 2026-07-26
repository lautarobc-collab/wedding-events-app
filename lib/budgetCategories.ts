// Categorías habituales de un presupuesto de boda, para ofrecer un punto de
// partida cerrado en vez de texto libre y evitar duplicados como "Flores" /
// "flores" / "Floristería" conviviendo como categorías distintas. "Otros"
// (en NewCategoryForm) sigue permitiendo cualquier nombre fuera de esta lista.
export const CANONICAL_BUDGET_CATEGORIES = [
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
