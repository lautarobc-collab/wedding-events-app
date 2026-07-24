-- Acceso público para la página de RSVP (/rsvp/[slug]/[guestId]), sin login.
--
-- No se abre RLS pública sobre events/guests/rsvp_responses: una política
-- "cualquiera puede leer si el evento tiene public_slug" dejaría consultar
-- la tabla entera (todos los invitados de todas las bodas) a quien sepa
-- pedir la API sin filtro, no solo a quien tenga el enlace concreto.
--
-- En su lugar, dos funciones SECURITY DEFINER: solo devuelven/escriben
-- exactamente la fila que coincide con (slug, guest_id), y no dependen de
-- las políticas RLS de las tablas subyacentes.

drop policy if exists "rsvp_responses_insert_public" on rsvp_responses;

create or replace function public.get_rsvp_invite(p_slug text, p_guest_id uuid)
returns table (
  event_id uuid,
  event_name text,
  event_date date,
  guest_id uuid,
  first_name text,
  last_name text,
  invited_plus_ones int,
  attending text,
  confirmed_plus_ones int,
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
    r.attending,
    r.confirmed_plus_ones,
    r.dietary_notes,
    r.message
  from guests g
  join events e on e.id = g.event_id
  left join lateral (
    select attending, confirmed_plus_ones, dietary_notes, message
    from rsvp_responses
    where guest_id = g.id
    order by responded_at desc
    limit 1
  ) r on true
  where e.public_slug = p_slug
    and g.id = p_guest_id;
$$;

grant execute on function public.get_rsvp_invite(text, uuid) to anon, authenticated;

create or replace function public.submit_rsvp(
  p_slug text,
  p_guest_id uuid,
  p_attending text,
  p_confirmed_plus_ones int,
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

  insert into rsvp_responses (guest_id, attending, confirmed_plus_ones, dietary_notes, message)
  values (p_guest_id, p_attending, p_confirmed_plus_ones, p_dietary_notes, p_message);
end;
$$;

grant execute on function public.submit_rsvp(text, uuid, text, int, text, text) to anon, authenticated;
