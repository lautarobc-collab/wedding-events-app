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
  location: string | null;
  total_budget: number | null;
  public_slug: string | null;
  created_at: string;
  summary_public_token: string | null;
};

export type Category = {
  id: string;
  event_id: string;
  name: string;
  sort_order: number;
};

export type BudgetItem = {
  id: string;
  category_id: string;
  description: string;
  estimated: number;
  actual: number;
  vendor_id: string | null;
};

export type AttendingStatus = "si" | "no" | "quizas";

export const ATTENDING_LABEL: Record<AttendingStatus, string> = {
  si: "Confirmado",
  no: "No asiste",
  quizas: "Quizás",
};

export type InvitationStatus = "por_decidir" | "invitado";

export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  por_decidir: "Por decidir",
  invitado: "Invitación enviada",
};

export type Guest = {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  invited_by: string | null;
  dietary_restrictions: string | null;
  table_id: string | null;
  gift_description: string | null;
  thank_you_sent: boolean;
  invitation_status: InvitationStatus;
};

export type SeatingTable = {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  sort_order: number;
};

export type GuestCompanion = {
  id: string;
  guest_id: string;
  name: string | null;
  is_child: boolean;
  dietary_restrictions: string | null;
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

export type TaskRecurrence = "none" | "weekly" | "monthly";

export const TASK_RECURRENCE_LABEL: Record<TaskRecurrence, string> = {
  none: "No se repite",
  weekly: "Cada semana",
  monthly: "Cada mes",
};

export type Task = {
  id: string;
  event_id: string;
  title: string;
  due_date: string | null;
  status: TaskStatus;
  notes: string | null;
  guest_id: string | null;
  budget_item_id: string | null;
  vendor_id: string | null;
  category_id: string | null;
  recurrence: TaskRecurrence;
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

export type VendorAttachment = {
  id: string;
  vendor_id: string;
  file_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};
