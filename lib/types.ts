export type EventType = "boda" | "evento_generico";

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  boda: "Boda",
  evento_generico: "Evento genérico",
};

export type Event = {
  id: string;
  owner_id: string;
  name: string;
  event_type: EventType;
  event_date: string | null;
  total_budget: number | null;
  public_slug: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  event_id: string;
  name: string;
  estimated_amount: number;
  sort_order: number;
};

export type BudgetItem = {
  id: string;
  category_id: string;
  description: string;
  estimated: number;
  actual: number;
};

export type AttendingStatus = "si" | "no" | "quizas";

export const ATTENDING_LABEL: Record<AttendingStatus, string> = {
  si: "Confirmado",
  no: "No asiste",
  quizas: "Quizás",
};

export type Guest = {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  invited_by: string | null;
  plus_ones: number;
  children_count: number;
  dietary_restrictions: string | null;
  table_number: number | null;
  gift_description: string | null;
  thank_you_sent: boolean;
};

export type RsvpResponse = {
  id: string;
  guest_id: string;
  attending: AttendingStatus | null;
  confirmed_plus_ones: number | null;
  confirmed_children: number | null;
  dietary_notes: string | null;
  message: string | null;
  responded_at: string;
};

export type TaskStatus = "sin_empezar" | "en_curso" | "completado";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  sin_empezar: "Sin empezar",
  en_curso: "En curso",
  completado: "Completado",
};

export type Task = {
  id: string;
  event_id: string;
  title: string;
  due_date: string | null;
  status: TaskStatus;
  notes: string | null;
};

export type VendorStatus = "candidato" | "contactado" | "elegido" | "descartado";

export const VENDOR_STATUS_LABEL: Record<VendorStatus, string> = {
  candidato: "Candidato",
  contactado: "Contactado",
  elegido: "Elegido",
  descartado: "Descartado",
};

export type Vendor = {
  id: string;
  category_id: string;
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  estimated: number | null;
  actual: number | null;
  status: VendorStatus;
  notes: string | null;
};
