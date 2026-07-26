-- Un gasto puede vincularse opcionalmente al proveedor concreto que lo cubre.
-- Si un proveedor "elegido" tiene un gasto vinculado, ese gasto manda y el
-- proveedor deja de sumarse aparte (evita el doble conteo); si no tiene
-- ningún gasto vinculado, el proveedor sigue contando solo, como hasta ahora.

alter table budget_items add column vendor_id uuid references vendors on delete set null;
