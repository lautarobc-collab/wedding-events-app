-- La migración 0003 quitó la política pública de inserción en rsvp_responses
-- a propósito (solo se escribe vía la función SECURITY DEFINER submit_rsvp,
-- para no exponer la tabla). Pero eso también bloqueó al propio dueño del
-- evento: confirmar manualmente un invitado desde el panel (setGuestAttending)
-- inserta en esta misma tabla con su sesión normal, sin pasar por submit_rsvp,
-- y no había ninguna política que lo permitiera. Se añade una scoped al dueño,
-- igual que ya existe para el select.

create policy "rsvp_responses_insert_owner" on rsvp_responses
  for insert with check (
    exists (
      select 1 from guests g
      join events e on e.id = g.event_id
      where g.id = rsvp_responses.guest_id and e.owner_id = auth.uid()
    )
  );
