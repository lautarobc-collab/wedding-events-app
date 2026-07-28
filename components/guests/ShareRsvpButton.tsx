"use client";

import { useRef, useState, type FocusEvent } from "react";
import { QRCodeSVG } from "qrcode.react";

export function ShareRsvpButton({
  slug,
  guestId,
  guestName,
}: {
  slug: string;
  guestId: string;
  guestName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/rsvp/${slug}/${guestId}` : "";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Hola ${guestName}, confírmanos tu asistencia aquí: ${url}`,
  )}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} onBlur={handleBlur} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="underline">
        Compartir RSVP
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 flex w-48 flex-col gap-2 rounded border border-neutral-200 bg-white p-3 text-sm shadow-lg">
          <button type="button" onClick={handleCopy} className="text-left underline">
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Enviar por WhatsApp
          </a>
          {url && (
            <div className="flex flex-col items-center gap-1 border-t border-neutral-100 pt-2">
              <QRCodeSVG value={url} size={112} />
              <span className="text-xs text-neutral-400">Código QR del enlace</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
