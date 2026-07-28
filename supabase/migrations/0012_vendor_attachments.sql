-- Adjuntos por proveedor (presupuestos en PDF, fotos de contratos...).
-- Varios archivos por proveedor, privados: mismo criterio de RLS que el
-- resto de la app (dueño del evento vía categories -> events), aplicado
-- tanto a la tabla de metadatos como al propio bucket de Storage.

insert into storage.buckets (id, name, public)
values ('vendor-attachments', 'vendor-attachments', false)
on conflict (id) do nothing;

create table vendor_attachments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors on delete cascade not null,
  file_path text not null,
  file_name text not null,
  content_type text not null,
  size_bytes int not null,
  created_at timestamptz default now()
);

alter table vendor_attachments enable row level security;

create policy "vendor_attachments_select_own" on vendor_attachments
  for select using (
    exists (
      select 1 from vendors v
      join categories c on c.id = v.category_id
      join events e on e.id = c.event_id
      where v.id = vendor_attachments.vendor_id and e.owner_id = auth.uid()
    )
  );
create policy "vendor_attachments_insert_own" on vendor_attachments
  for insert with check (
    exists (
      select 1 from vendors v
      join categories c on c.id = v.category_id
      join events e on e.id = c.event_id
      where v.id = vendor_attachments.vendor_id and e.owner_id = auth.uid()
    )
  );
create policy "vendor_attachments_delete_own" on vendor_attachments
  for delete using (
    exists (
      select 1 from vendors v
      join categories c on c.id = v.category_id
      join events e on e.id = c.event_id
      where v.id = vendor_attachments.vendor_id and e.owner_id = auth.uid()
    )
  );

-- El nombre de cada objeto en Storage empieza por "<vendor_id>/...", así que
-- comprobamos la propiedad igual que arriba sin necesitar una columna
-- owner_id en storage.objects.
create policy "vendor_attachments_storage_select" on storage.objects
  for select using (
    bucket_id = 'vendor-attachments'
    and exists (
      select 1 from vendors v
      join categories c on c.id = v.category_id
      join events e on e.id = c.event_id
      where v.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );
create policy "vendor_attachments_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'vendor-attachments'
    and exists (
      select 1 from vendors v
      join categories c on c.id = v.category_id
      join events e on e.id = c.event_id
      where v.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );
create policy "vendor_attachments_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'vendor-attachments'
    and exists (
      select 1 from vendors v
      join categories c on c.id = v.category_id
      join events e on e.id = c.event_id
      where v.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );
