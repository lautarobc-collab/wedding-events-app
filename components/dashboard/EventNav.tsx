"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "", label: "Resumen" },
  { href: "/presupuesto", label: "Presupuesto" },
  { href: "/invitados", label: "Invitados" },
  { href: "/tareas", label: "Tareas" },
  { href: "/proveedores", label: "Proveedores" },
];

export function EventNav({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const pathname = usePathname();
  const base = `/eventos/${eventId}`;

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1">
      <Link
        href="/"
        className="mb-4 text-sm text-neutral-500 underline"
      >
        ← Tus eventos
      </Link>
      <p className="mb-2 truncate font-medium">{eventName}</p>
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`rounded px-3 py-2 text-sm ${
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
