-- Resumen de solo lectura compartible: un enlace público con solo los
-- números agregados del evento (sin nombres ni datos personales), activable
-- y desactivable por el dueño. Igual que el RSVP público, se sirve vía una
-- función SECURITY DEFINER en vez de abrir RLS pública sobre las tablas.

alter table events add column summary_public_token uuid unique;

create or replace function public.get_public_summary(p_token uuid)
returns table (
  event_name text,
  event_date date,
  budget_total numeric,
  budget_estimated numeric,
  budget_actual numeric,
  guests_total int,
  guests_confirmed int,
  tasks_total int,
  tasks_pending int,
  vendors_total int,
  vendors_chosen int
)
language sql
security definer
set search_path = public
as $$
  with ev as (
    select id, name, event_date, total_budget
    from events
    where summary_public_token = p_token
  ),
  cats as (
    select c.id from categories c join ev on ev.id = c.event_id
  ),
  items as (
    select bi.* from budget_items bi join cats on cats.id = bi.category_id
  ),
  vend as (
    select v.* from vendors v join cats on cats.id = v.category_id
  ),
  linked_vendor_ids as (
    select distinct vendor_id from items where vendor_id is not null
  ),
  standalone_chosen_vendors as (
    select v.* from vend v
    where v.status = 'elegido'
      and v.id not in (select vendor_id from linked_vendor_ids)
  ),
  g as (
    select gu.* from guests gu join ev on ev.id = gu.event_id
  ),
  latest_rsvp as (
    select distinct on (r.guest_id) r.guest_id, r.attending
    from rsvp_responses r
    join g on g.id = r.guest_id
    order by r.guest_id, r.responded_at desc
  ),
  t as (
    select ta.* from tasks ta join ev on ev.id = ta.event_id
  )
  select
    ev.name,
    ev.event_date,
    ev.total_budget,
    coalesce((select sum(estimated) from items), 0)
      + coalesce((select sum(estimated) from standalone_chosen_vendors), 0),
    coalesce((select sum(actual) from items), 0)
      + coalesce((select sum(actual) from standalone_chosen_vendors), 0),
    (select count(*) from g)::int,
    (select count(*) from latest_rsvp where attending = 'si')::int,
    (select count(*) from t)::int,
    (select count(*) from t where status <> 'completado')::int,
    (select count(*) from vend)::int,
    (select count(*) from vend where status = 'elegido')::int
  from ev;
$$;

grant execute on function public.get_public_summary(uuid) to anon, authenticated;
