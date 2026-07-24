-- Esquema inicial: eventos, categorías, proveedores, presupuesto, tareas,
-- invitados y respuestas de RSVP. Ver docs/DESIGN.md para el diseño completo.

create table events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  event_type text not null default 'boda', -- 'boda' | 'evento_generico'
  event_date date,
  total_budget numeric,
  public_slug text unique, -- para la URL pública de RSVP
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events not null,
  name text not null, -- ej. "Catering", "Flores", "Fotografía"
  estimated_amount numeric default 0,
  sort_order int default 0
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories not null,
  name text not null,
  contact_phone text,
  contact_email text,
  website text,
  price numeric,
  status text default 'candidato', -- 'candidato' | 'contactado' | 'elegido' | 'descartado'
  notes text
);

create table budget_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories not null,
  description text not null,
  estimated numeric default 0,
  actual numeric default 0
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events not null,
  title text not null,
  due_date date,
  status text default 'sin_empezar', -- 'sin_empezar' | 'en_curso' | 'completado'
  notes text
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events not null,
  first_name text not null,
  last_name text,
  email text,
  invited_by text,
  plus_ones int default 0,
  dietary_restrictions text,
  table_number int,
  gift_description text,
  thank_you_sent boolean default false
);

create table rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests not null,
  attending text, -- 'si' | 'no' | 'quizas'
  confirmed_plus_ones int,
  dietary_notes text,
  message text,
  responded_at timestamptz default now()
);

-- Row Level Security -------------------------------------------------------

alter table events enable row level security;
alter table categories enable row level security;
alter table vendors enable row level security;
alter table budget_items enable row level security;
alter table tasks enable row level security;
alter table guests enable row level security;
alter table rsvp_responses enable row level security;

-- events: el dueño ve y edita solo sus propios eventos.
create policy "events_select_own" on events
  for select using (owner_id = auth.uid());
create policy "events_insert_own" on events
  for insert with check (owner_id = auth.uid());
create policy "events_update_own" on events
  for update using (owner_id = auth.uid());
create policy "events_delete_own" on events
  for delete using (owner_id = auth.uid());

-- categories: filtrado en cascada por el dueño del evento.
create policy "categories_select_own" on categories
  for select using (
    exists (
      select 1 from events e
      where e.id = categories.event_id and e.owner_id = auth.uid()
    )
  );
create policy "categories_insert_own" on categories
  for insert with check (
    exists (
      select 1 from events e
      where e.id = categories.event_id and e.owner_id = auth.uid()
    )
  );
create policy "categories_update_own" on categories
  for update using (
    exists (
      select 1 from events e
      where e.id = categories.event_id and e.owner_id = auth.uid()
    )
  );
create policy "categories_delete_own" on categories
  for delete using (
    exists (
      select 1 from events e
      where e.id = categories.event_id and e.owner_id = auth.uid()
    )
  );

-- vendors: filtrado en cascada vía categories -> events.
create policy "vendors_select_own" on vendors
  for select using (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = vendors.category_id and e.owner_id = auth.uid()
    )
  );
create policy "vendors_insert_own" on vendors
  for insert with check (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = vendors.category_id and e.owner_id = auth.uid()
    )
  );
create policy "vendors_update_own" on vendors
  for update using (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = vendors.category_id and e.owner_id = auth.uid()
    )
  );
create policy "vendors_delete_own" on vendors
  for delete using (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = vendors.category_id and e.owner_id = auth.uid()
    )
  );

-- budget_items: filtrado en cascada vía categories -> events.
create policy "budget_items_select_own" on budget_items
  for select using (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = budget_items.category_id and e.owner_id = auth.uid()
    )
  );
create policy "budget_items_insert_own" on budget_items
  for insert with check (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = budget_items.category_id and e.owner_id = auth.uid()
    )
  );
create policy "budget_items_update_own" on budget_items
  for update using (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = budget_items.category_id and e.owner_id = auth.uid()
    )
  );
create policy "budget_items_delete_own" on budget_items
  for delete using (
    exists (
      select 1 from categories c
      join events e on e.id = c.event_id
      where c.id = budget_items.category_id and e.owner_id = auth.uid()
    )
  );

-- tasks: filtrado en cascada por el dueño del evento.
create policy "tasks_select_own" on tasks
  for select using (
    exists (
      select 1 from events e
      where e.id = tasks.event_id and e.owner_id = auth.uid()
    )
  );
create policy "tasks_insert_own" on tasks
  for insert with check (
    exists (
      select 1 from events e
      where e.id = tasks.event_id and e.owner_id = auth.uid()
    )
  );
create policy "tasks_update_own" on tasks
  for update using (
    exists (
      select 1 from events e
      where e.id = tasks.event_id and e.owner_id = auth.uid()
    )
  );
create policy "tasks_delete_own" on tasks
  for delete using (
    exists (
      select 1 from events e
      where e.id = tasks.event_id and e.owner_id = auth.uid()
    )
  );

-- guests: filtrado en cascada por el dueño del evento.
create policy "guests_select_own" on guests
  for select using (
    exists (
      select 1 from events e
      where e.id = guests.event_id and e.owner_id = auth.uid()
    )
  );
create policy "guests_insert_own" on guests
  for insert with check (
    exists (
      select 1 from events e
      where e.id = guests.event_id and e.owner_id = auth.uid()
    )
  );
create policy "guests_update_own" on guests
  for update using (
    exists (
      select 1 from events e
      where e.id = guests.event_id and e.owner_id = auth.uid()
    )
  );
create policy "guests_delete_own" on guests
  for delete using (
    exists (
      select 1 from events e
      where e.id = guests.event_id and e.owner_id = auth.uid()
    )
  );

-- rsvp_responses: política especial. Escritura pública (el invitado responde
-- sin login desde /rsvp/[slug]); lectura solo para el dueño del evento.
create policy "rsvp_responses_insert_public" on rsvp_responses
  for insert with check (true);

create policy "rsvp_responses_select_owner" on rsvp_responses
  for select using (
    exists (
      select 1 from guests g
      join events e on e.id = g.event_id
      where g.id = rsvp_responses.guest_id and e.owner_id = auth.uid()
    )
  );
