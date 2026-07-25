-- Distingue cuántos de los acompañantes de un invitado son niños, tanto al
-- invitar (guests.children_count) como al confirmar por RSVP
-- (rsvp_responses.confirmed_children).

alter table guests add column children_count int not null default 0;
alter table guests add constraint guests_children_count_check
  check (children_count >= 0 and children_count <= plus_ones);

alter table rsvp_responses add column confirmed_children int;

-- Las funciones públicas de RSVP cambian de forma (columnas nuevas), así que
-- hay que borrarlas antes de recrearlas: "create or replace" no permite
-- cambiar el tipo de retorno ni la lista de parámetros de una función ya
-- existente.

drop function if exists public.get_rsvp_invite(text, uuid);
drop function if exists public.submit_rsvp(text, uuid, text, int, text, text);

create function public.get_rsvp_invite(p_slug text, p_guest_id uuid)
returns table (
  event_id uuid,
  event_name text,
  event_date date,
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
    g.id,
    g.first_name,
    g.last_name,
    g.plus_ones,
    g.children_count,
    r.attending,
    r.confirmed_plus_ones,
    r.confirmed_children,
    r.dietary_notes,
    r.message
  from guests g
  join events e on e.id = g.event_id
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

create function public.submit_rsvp(
  p_slug text,
  p_guest_id uuid,
  p_attending text,
  p_confirmed_plus_ones int,
  p_confirmed_children int,
  p_dietary_notes text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from guests g
    join events e on e.id = g.event_id
    where g.id = p_guest_id and e.public_slug = p_slug
  ) then
    raise exception 'Invitado no encontrado';
  end if;

  insert into rsvp_responses (
    guest_id, attending, confirmed_plus_ones, confirmed_children, dietary_notes, message
  )
  values (
    p_guest_id, p_attending, p_confirmed_plus_ones, p_confirmed_children, p_dietary_notes, p_message
  );
end;
$$;

grant execute on function public.submit_rsvp(text, uuid, text, int, int, text, text) to anon, authenticated;
