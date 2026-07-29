-- Tareas recurrentes: al completar una tarea con recurrencia, se genera
-- automáticamente la siguiente (ver updateTask en tareas/actions.ts).

alter table tasks add column recurrence text not null default 'none'
  check (recurrence in ('none', 'weekly', 'monthly'));
