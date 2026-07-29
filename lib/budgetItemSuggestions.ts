// Sugerencias rápidas de descripción de gasto según el nombre de la
// categoría, para no tener que escribir siempre desde cero. Solo cubre las
// categorías canónicas de lib/budgetCategories.ts — una categoría con
// nombre propio ("Otros", o renombrada a mano) simplemente no tiene
// sugerencias, y el campo de descripción funciona como siempre.
const SUGGESTIONS_BY_CATEGORY: Record<string, string[]> = {
  "Lugar y catering": [
    "Alquiler del espacio",
    "Catering / menú",
    "Barra libre",
    "Aperitivo de bienvenida",
  ],
  "Fotografía y vídeo": ["Reportaje fotográfico", "Vídeo del evento", "Fotomatón", "Book de pareja"],
  "Música y entretenimiento": ["DJ", "Grupo en vivo", "Animación para niños", "Fuegos artificiales"],
  "Flores y decoración": [
    "Ramo de novia",
    "Centros de mesa",
    "Decoración de la ceremonia",
    "Flores para el cortejo",
  ],
  "Vestuario y belleza": ["Vestido de novia", "Traje del novio", "Peluquería", "Maquillaje"],
  "Papelería e invitaciones": ["Invitaciones", "Menús impresos", "Cartel de mesas", "Libro de firmas"],
  Transporte: ["Coche de novios", "Transporte de invitados"],
  Alojamiento: ["Hotel para los novios", "Habitaciones para invitados"],
  Pastel: ["Tarta nupcial", "Mesa dulce"],
  Anillos: ["Alianzas"],
  "Luna de miel": ["Vuelos", "Hotel", "Excursiones"],
  "Regalos y detalles": ["Detalles para invitados", "Regalos para padrinos"],
  "Oficiante y ceremonia": ["Oficiante", "Alquiler de sillas", "Sonido de la ceremonia"],
  "Lugar de celebración": ["Alquiler del espacio", "Seguro de responsabilidad civil"],
  Catering: ["Menú / catering", "Barra libre", "Servicio de camareros"],
  Decoración: ["Centros de mesa", "Iluminación", "Mantelería"],
  Fotografía: ["Reportaje fotográfico", "Vídeo del evento"],
  "Animación y música": ["DJ", "Grupo en vivo", "Animación"],
  Invitaciones: ["Invitaciones", "Diseño gráfico"],
  Varios: ["Imprevistos"],
};

export function getBudgetItemSuggestions(categoryName: string): string[] {
  return SUGGESTIONS_BY_CATEGORY[categoryName] ?? [];
}
