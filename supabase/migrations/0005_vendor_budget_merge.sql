-- Un proveedor "elegido" pasa a contar automáticamente como gasto de su
-- categoría en Presupuesto, sin necesidad de crear una línea de gasto
-- aparte ni mantenerla sincronizada a mano: vendors.estimated/actual se
-- suman directamente a los totales de la categoría junto a budget_items.

alter table vendors rename column price to estimated;
alter table vendors add column actual numeric;
