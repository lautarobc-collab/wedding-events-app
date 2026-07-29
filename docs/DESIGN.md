# Diseño del producto

Documento de referencia. Se generó a partir de una hoja de Excel de planificación
de bodas (la fuente original de todas las categorías y campos abajo) más una
revisión de competidores existentes en el mercado (Zola, WeddingWire, The Knot,
Joy, Coordon). No es una spec cerrada — ajústala si en el desarrollo aparece
algo que no encaja.

## Diferencial frente a la competencia

- Nadie domina el mercado hispanohablante con una experiencia nativa y sin
  fricción de proveedores/publicidad de por medio (Zola y WeddingWire son
  angloparlantes y monetizan empujando anuncios de proveedores).
- Punto de partida: un modelo de datos ya maduro (años de uso real en la
  plantilla Excel de origen), no una hoja en blanco.
- Cubre bodas **y** eventos genéricos desde el modelo de datos, no como un
  añadido posterior.

## Modelo de datos (Postgres / Supabase)

Seis entidades principales. `event_type` en `events` decide qué categorías por
defecto se precargan — bodas y eventos genéricos comparten el mismo esqueleto.

```sql
-- Usuarios: gestionados por Supabase Auth (tabla auth.users), no se recrea aquí.

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
  notes text,
  -- vínculo opcional, como mucho a una de las cuatro (ver migración 0010)
  guest_id uuid references guests,
  budget_item_id uuid references budget_items,
  vendor_id uuid references vendors,
  category_id uuid references categories
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events not null,
  first_name text not null,
  last_name text,
  email text,
  invited_by text,
  dietary_restrictions text,
  table_id uuid references tables, -- ver tables abajo (migración 0015)
  invitation_status text not null default 'invitado',
  gift_description text,
  thank_you_sent boolean default false
);
-- acompañantes: ver guest_companions (migración 0006)

create table tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events not null,
  name text not null,
  capacity int not null default 8,
  sort_order int default 0
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
```

Todas las tablas salvo `rsvp_responses` deben llevar Row Level Security: un
usuario solo ve/edita filas de `events` donde `owner_id = auth.uid()`, y las
tablas hijas se filtran por su `event_id`/`category_id` en cascada.
`rsvp_responses` necesita una política especial: escritura pública (sin login)
para el invitado que responde vía el enlace de `public_slug`, pero lectura
solo para el dueño del evento.

## Categorías por defecto — plantilla "boda"

Tareas, Organización, Programación del día, Lugar de celebración, Hotel,
Trajes, Peluquería y maquillaje, Flores, Tarta nupcial, Servicio de catering,
Fotografía, Vídeo, Animación y música, Invitaciones, Regalos. (Origen: pestañas
del Excel base.)

## Categorías por defecto — plantilla "evento genérico"

Set reducido y neutro: Lugar de celebración, Catering, Decoración, Fotografía,
Animación/Música, Invitaciones, Varios. El usuario puede añadir/quitar
categorías libremente en ambos casos — igual que en el Excel original.

## Pantallas del MVP

1. **Login / registro** — email + password vía Supabase Auth.
2. **Selector de eventos** — lista de eventos del usuario, crear nuevo evento
   (elige tipo: boda / evento genérico).
3. **Panel del evento** (privado, autenticado) con navegación lateral:
   - Resumen — métricas clave + próximas tareas
   - Presupuesto — calculadora resumen + desglose detallado por categoría
   - Invitados — tabla + estado de RSVP agregado
   - Tareas — checklist con fecha y estado
   - Proveedores — comparador por categoría
4. **Página pública de RSVP** (`/rsvp/[slug]`, sin login) — el invitado
   confirma asistencia, acompañantes y restricciones alimentarias.

El mockup de referencia visual (estilo, tarjetas de métrica, tabla de
invitados, tabs de navegación) se compartió y aprobó en la conversación de
diseño previa a este documento — replica ese lenguaje visual: superficies
planas, bordes finos, sin gradientes ni sombras decorativas.

## Fases de construcción sugeridas

1. **Fase 1** — Auth + CRUD de eventos + esqueleto de navegación del panel.
2. **Fase 2** — Presupuesto (categorías + budget_items) con cálculos en vivo.
3. **Fase 3** — Invitados (CRUD) + página pública de RSVP + escritura de
   `rsvp_responses`.
4. **Fase 4** — Tareas y proveedores.
5. **Fase 5** — Pulido: responsive móvil, estados vacíos, exportación PDF del
   resumen (opcional, evaluar si aporta o si es ruido).

No pases a la fase siguiente sin que la anterior funcione de punta a punta
(crear dato → verlo reflejado en la UI → persistir en Supabase).
