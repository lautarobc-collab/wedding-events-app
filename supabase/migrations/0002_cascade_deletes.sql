-- Al borrar un evento (o una categoría) deben desaparecer sus datos hijos
-- automáticamente. La migración inicial no lo especificaba y Postgres, por
-- defecto, bloquea el borrado si quedan filas hijas apuntando a la fila
-- padre. A partir de acá el borrado se propaga en cascada.

alter table categories drop constraint categories_event_id_fkey;
alter table categories add constraint categories_event_id_fkey
  foreign key (event_id) references events on delete cascade;

alter table vendors drop constraint vendors_category_id_fkey;
alter table vendors add constraint vendors_category_id_fkey
  foreign key (category_id) references categories on delete cascade;

alter table budget_items drop constraint budget_items_category_id_fkey;
alter table budget_items add constraint budget_items_category_id_fkey
  foreign key (category_id) references categories on delete cascade;

alter table tasks drop constraint tasks_event_id_fkey;
alter table tasks add constraint tasks_event_id_fkey
  foreign key (event_id) references events on delete cascade;

alter table guests drop constraint guests_event_id_fkey;
alter table guests add constraint guests_event_id_fkey
  foreign key (event_id) references events on delete cascade;

alter table rsvp_responses drop constraint rsvp_responses_guest_id_fkey;
alter table rsvp_responses add constraint rsvp_responses_guest_id_fkey
  foreign key (guest_id) references guests on delete cascade;
