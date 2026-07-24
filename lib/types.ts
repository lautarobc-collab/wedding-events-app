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
