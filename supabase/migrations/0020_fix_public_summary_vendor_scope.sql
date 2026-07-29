-- get_public_summary tenía el mismo problema que se corrigió en el
-- dashboard privado (commit c960f53): un proveedor "elegido" con un
-- vínculo manual a un gasto de OTRA categoría se contaba como "ya cubierto"
-- aunque su propia categoría no tuviera ningún gasto vinculado, y su coste
-- desaparecía de los totales. Además no excluía proveedores archivados.

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
    where not v.archived
  ),
  standalone_chosen_vendors as (
    select v.* from vend v
    where v.status = 'elegido'
      and not exists (
        select 1 from items i
        where i.vendor_id = v.id and i.category_id = v.category_id
      )
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
