-- Cada acompañante pasa a ser su propia fila (nombre opcional, si es niño,
-- alergias propias) en vez de dos números sueltos en guests. El total de
-- acompañantes/niños de un invitado se deriva de contar sus filas, así que
-- guests.plus_ones y guests.children_count desaparecen.

create table guest_companions (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests not null,
  name text,
  is_child boolean not null default false,
  dietary_restrictions text
);

alter table guest_companions enable row level security;

create policy "guest_companions_select_own" on guest_companions
  for select using (
    exists (
      select 1 from guests g
      join events e on e.id = g.event_id
      where g.id = guest_companions.guest_id and e.owner_id = auth.uid()
    )
  );
create policy "guest_companions_insert_own" on guest_companions
  for insert with check (
    exists (
      select 1 from guests g
      join events e on e.id = g.event_id
      where g.id = guest_companions.guest_id and e.owner_id = auth.uid()
    )
  );
create policy "guest_companions_update_own" on guest_companions
  for update using (
    exists (
      select 1 from guests g
      join events e on e.id = g.event_id
      where g.id = guest_companions.guest_id and e.owner_id = auth.uid()
    )
  );
create policy "guest_companions_delete_own" on guest_companions
  for delete using (
    exists (
      select 1 from guests g
      join events e on e.id = g.event_id
      where g.id = guest_companions.guest_id and e.owner_id = auth.uid()
    )
  );

alter table guest_companions drop constraint guest_companions_guest_id_fkey;
alter table guest_companions add constraint guest_companions_guest_id_fkey
  foreign key (guest_id) references guests on delete cascade;

alter table guests drop constraint if exists guests_children_count_check;
alter table guests drop column plus_ones;
alter table guests drop column children_count;

-- get_rsvp_invite calculaba invited_plus_ones/invited_children desde las
-- columnas que se acaban de borrar; hay que recrearla apuntando a
-- guest_companions. submit_rsvp no las usaba, no hace falta tocarla.

drop function if exists public.get_rsvp_invite(text, uuid);

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
