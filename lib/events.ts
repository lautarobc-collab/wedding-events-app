import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const getEvent = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle<Event>();
  return data;
});
