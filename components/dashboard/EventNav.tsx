"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "", label: "Resumen" },
  { href: "/presupuesto", label: "Presupuesto" },
  { href: "/invitados", label: "Invitados" },
  { href: "/mesas", label: "Mesas" },
  { href: "/tareas", label: "Tareas" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/regalos", label: "Regalos" },
];

export function EventNav({
  eventId,
  eventName,
  overdueTasksCount,
}: {
  eventId: string;
  eventName: string;
  overdueTasksCount: number;
}) {
  const pathname = usePathname();
  const base = `/eventos/${eventId}`;

  return (
    <nav className="flex flex-col gap-1 sm:w-48 sm:shrink-0">
      <Link
        href="/"
        className="mb-2 text-sm text-neutral-500 dark:text-neutral-400 underline sm:mb-4"
      >
        ← Tus eventos
      </Link>
      <p className="mb-2 truncate font-medium">{eventName}</p>
      <div className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
        {TABS.map((tab) => {
          const href = `${base}${tab.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`shrink-0 rounded px-3 py-2 text-sm ${
                isActive
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {tab.label}
              {tab.href === "/tareas" && overdueTasksCount > 0 && (
                <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white dark:bg-red-500">
                  {overdueTasksCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
