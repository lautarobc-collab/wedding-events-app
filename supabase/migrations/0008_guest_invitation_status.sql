-- Ciclo de invitación controlado por el anfitrión, independiente de si el
-- invitado ya respondió el RSVP público. "invitado" es el valor por defecto
-- porque, en la práctica, si ya lo diste de alta es porque piensas invitarlo;
-- "por_decidir" es la excepción para quien todavía no tienes claro si invitar.

alter table guests add column invitation_status text not null default 'invitado'
  check (invitation_status in ('por_decidir', 'invitado'));
