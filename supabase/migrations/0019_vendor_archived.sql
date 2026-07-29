-- Papelera de proveedores: en vez de borrar un proveedor, se puede
-- "archivar" (guardar como contacto) para sacarlo de la vista activa sin
-- perder sus datos. No afecta a las políticas RLS existentes: siguen
-- filtrando por dueño del evento igual que antes, con o sin este campo.

alter table vendors add column archived boolean not null default false;
