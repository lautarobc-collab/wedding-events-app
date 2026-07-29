-- #58: el invitado puede escribir el nombre de cada acompañante al
-- confirmar. Función nueva para leer sus propios acompañantes (mismo patrón
-- que get_rsvp_invite: SECURITY DEFINER, sin abrir RLS pública) y
-- submit_rsvp gana un parámetro opcional para guardar esos nombres.

create or replace function public.get_rsvp_companions(p_slug text, p_guest_id uuid)
returns table (id uuid, is_child boolean, name text)
language sql
security definer
set search_path = public
as $$
  select gc.id, gc.is_child, gc.name
  from guest_companions gc
  join guests g on g.id = gc.guest_id
  join events e on e.id = g.event_id
  where e.public_slug = p_slug and g.id = p_guest_id
  order by gc.is_child, gc.id;
$$;

grant execute on function public.get_rsvp_companions(text, uuid) to anon, authenticated;

create or replace function public.submit_rsvp(
  p_slug text,
  p_guest_id uuid,
  p_attending text,
  p_confirmed_plus_ones int,
  p_confirmed_children int,
  p_dietary_notes text,
  p_message text,
  p_companion_names jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invited_total int;
  v_invited_children int;
  v_item jsonb;
begin
  if not exists (
    select 1 from guests g
    join events e on e.id = g.event_id
    where g.id = p_guest_id and e.public_slug = p_slug
  ) then
    raise exception 'Invitado no encontrado';
  end if;

  select count(*), count(*) filter (where is_child)
    into v_invited_total, v_invited_children
    from guest_companions
    where guest_id = p_guest_id;

  if p_confirmed_plus_ones is not null and p_confirmed_plus_ones > v_invited_total then
    raise exception 'No puede confirmar más acompañantes de los invitados';
  end if;

  if p_confirmed_children is not null and p_confirmed_children > v_invited_children then
    raise exception 'No puede confirmar más niños de los invitados';
  end if;

  if p_confirmed_children is not null
     and p_confirmed_children > coalesce(p_confirmed_plus_ones, 0) then
    raise exception 'No puede haber más niños que acompañantes confirmados';
  end if;

  insert into rsvp_responses (
    guest_id, attending, confirmed_plus_ones, confirmed_children, dietary_notes, message
  )
  values (
    p_guest_id, p_attending, p_confirmed_plus_ones, p_confirmed_children, p_dietary_notes, p_message
  );

  -- Actualiza solo los acompañantes que ya pertenecían a este invitado
  -- (el where guest_id = p_guest_id es lo que impide tocar filas ajenas,
  -- aunque llegara un id manipulado).
  for v_item in select * from jsonb_array_elements(p_companion_names)
  loop
    update guest_companions
    set name = nullif(trim(v_item->>'name'), '')
    where id = (v_item->>'id')::uuid and guest_id = p_guest_id;
  end loop;
end;
$$;

grant execute on function public.submit_rsvp(text, uuid, text, int, int, text, text, jsonb) to anon, authenticated;

-- #59: grupo/etiqueta libre por invitado (familia, amigos, trabajo...).
alter table guests add column group_label text;

-- #60: fecha de gasto opcional por línea de presupuesto, para poder
-- agruparlo por mes en un gráfico de gasto en el tiempo.
alter table budget_items add column expense_date date;
