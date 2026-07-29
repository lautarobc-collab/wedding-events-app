-- Plano de mesas: mesas de verdad (nombre + aforo) en vez del número suelto
-- que tenía cada invitado. La asignación es por selector, no arrastrar y
-- soltar, así que no hace falta guardar posición x/y, solo la relación
-- invitado -> mesa.

create table tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade not null,
  name text not null,
  capacity int not null default 8,
  sort_order int not null default 0
);

alter table tables enable row level security;

create policy "tables_select_own" on tables
  for select using (
    exists (select 1 from events e where e.id = tables.event_id and e.owner_id = auth.uid())
  );
create policy "tables_insert_own" on tables
  for insert with check (
    exists (select 1 from events e where e.id = tables.event_id and e.owner_id = auth.uid())
  );
create policy "tables_update_own" on tables
  for update using (
    exists (select 1 from events e where e.id = tables.event_id and e.owner_id = auth.uid())
  );
create policy "tables_delete_own" on tables
  for delete using (
    exists (select 1 from events e where e.id = tables.event_id and e.owner_id = auth.uid())
  );

alter table guests add column table_id uuid references tables on delete set null;
alter table guests drop column table_number;
