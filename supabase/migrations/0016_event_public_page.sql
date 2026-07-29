-- Web de evento pública: página informativa por evento (fecha + ubicación),
-- enlazada desde cada RSVP individual. Igual que el resumen público, se sirve
-- vía función SECURITY DEFINER en vez de RLS pública sobre events (esa
-- expondría columnas sensibles como owner_id o total_budget).

alter table events add column location text;

create or replace function public.get_public_event_info(p_slug text)
returns table (
  event_name text,
  event_date date,
  location text
)
language sql
security definer
set search_path = public
as $$
  select name, event_date, location from events where public_slug = p_slug;
$$;

grant execute on function public.get_public_event_info(text) to anon, authenticated;
