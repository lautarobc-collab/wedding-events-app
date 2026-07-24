export type EventType = "boda" | "evento_generico";

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
