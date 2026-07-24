"use client";

import { useState } from "react";

export function CopyRsvpLinkButton({
  slug,
  guestId,
}: {
  slug: string;
  guestId: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/rsvp/${slug}/${guestId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={handleCopy} className="underline">
      {copied ? "¡Copiado!" : "Copiar enlace RSVP"}
    </button>
  );
}
