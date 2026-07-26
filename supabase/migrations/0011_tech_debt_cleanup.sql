-- Deuda técnica acumulada (tareas #28, #29, #30), resuelta junta porque las
-- tres son cambios de limpieza sin impacto visible para quien usa la app.

-- #28: submit_rsvp validaba niños <= acompañantes confirmados, pero no
-- validaba los confirmados contra lo realmente invitado (guest_companions).
-- Hoy ese límite solo lo pone el atributo "max" del <input>, que cualquiera
-- puede saltarse llamando al RPC directamente.
create or replace function public.submit_rsvp(
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
declare
  v_invited_total int;
  v_invited_children int;
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
end;
$$;

grant execute on function public.submit_rsvp(text, uuid, text, int, int, text, text) to anon, authenticated;

-- #29: columnas tipo-enum sin CHECK a nivel de base de datos — hasta ahora
-- solo se validaban en zod, así que un insert directo (o un bug futuro)
-- podía colar un valor fuera de la lista.
alter table events add constraint events_event_type_check
  check (event_type in ('boda', 'evento_generico'));

alter table vendors add constraint vendors_status_check
  check (status in ('candidato', 'contactado', 'elegido', 'descartado'));

alter table tasks add constraint tasks_status_check
  check (status in ('sin_empezar', 'en_curso', 'completado'));

alter table rsvp_responses add constraint rsvp_responses_attending_check
  check (attending in ('si', 'no', 'quizas'));

-- #30: categories.estimated_amount nunca se leyó — los totales reales salen
-- de sumar budget_items y proveedores elegidos (ver lib/budget.ts). Se
-- insertaba siempre en 0 y no se usaba en ningún cálculo ni pantalla.
alter table categories drop column estimated_amount;
