-- Vincula una tarea, como mucho, a un invitado, un gasto, un proveedor o una
-- categoría (decisión del usuario: "como mucho uno", solo visible en Tareas).
-- Cuatro columnas nullable en vez de un diseño polimórfico (tipo + id) para
-- conservar integridad referencial real con cada tabla.

alter table tasks
  add column guest_id uuid references guests(id) on delete set null,
  add column budget_item_id uuid references budget_items(id) on delete set null,
  add column vendor_id uuid references vendors(id) on delete set null,
  add column category_id uuid references categories(id) on delete set null;

alter table tasks add constraint tasks_single_link_chk check (
  (case when guest_id is not null then 1 else 0 end) +
  (case when budget_item_id is not null then 1 else 0 end) +
  (case when vendor_id is not null then 1 else 0 end) +
  (case when category_id is not null then 1 else 0 end) <= 1
);
