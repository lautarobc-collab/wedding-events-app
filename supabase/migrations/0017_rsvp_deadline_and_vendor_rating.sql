-- #56: fecha límite de RSVP, visible en el RSVP público (hay que recrear
-- get_rsvp_invite porque cambia su forma de retorno) y usada por el
-- organizador para ver quién no respondió a tiempo.
alter table events add column rsvp_deadline date;

drop function if exists public.get_rsvp_invite(text, uuid);

create function public.get_rsvp_invite(p_slug text, p_guest_id uuid)
returns table (
  event_id uuid,
  event_name text,
  event_date date,
  rsvp_deadline date,
  guest_id uuid,
  first_name text,
  last_name text,
  invited_plus_ones int,
  invited_children int,
  attending text,
  confirmed_plus_ones int,
  confirmed_children int,
  dietary_notes text,
  message text
)
language sql
security definer
set search_path = public
as $$
  select
    e.id,
    e.name,
    e.event_date,
    e.rsvp_deadline,
    g.id,
    g.first_name,
    g.last_name,
    coalesce(c.total, 0)::int,
    coalesce(c.children, 0)::int,
    r.attending,
    r.confirmed_plus_ones,
    r.confirmed_children,
    r.dietary_notes,
    r.message
  from guests g
  join events e on e.id = g.event_id
  left join lateral (
    select count(*) as total, count(*) filter (where is_child) as children
    from guest_companions
    where guest_id = g.id
  ) c on true
  left join lateral (
    select attending, confirmed_plus_ones, confirmed_children, dietary_notes, message
    from rsvp_responses
    where guest_id = g.id
    order by responded_at desc
    limit 1
  ) r on true
  where e.public_slug = p_slug
    and g.id = p_guest_id;
$$;

grant execute on function public.get_rsvp_invite(text, uuid) to anon, authenticated;

-- #57: valoración con estrellas para proveedores.
alter table vendors add column rating int check (rating between 1 and 5);
