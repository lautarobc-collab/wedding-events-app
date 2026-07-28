import Link from "next/link";
import { formatMoney } from "@/lib/format";

function SummaryCard({
  href,
  title,
  primary,
  secondary,
}: {
  href: string;
  title: string;
  primary: string;
  secondary: string;
}) {
  return (
    <Link
      href={href}
      className="rounded border border-neutral-200 dark:border-neutral-800 p-4 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
    >
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="mt-1 text-lg font-medium">{primary}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{secondary}</p>
    </Link>
  );
}

export function SummaryCards({
  eventId,
  budgetEstimated,
  budgetActual,
  guestsTotal,
  guestsConfirmed,
  tasksTotal,
  tasksPending,
  vendorsTotal,
  vendorsChosen,
}: {
  eventId: string;
  budgetEstimated: number;
  budgetActual: number;
  guestsTotal: number;
  guestsConfirmed: number;
  tasksTotal: number;
  tasksPending: number;
  vendorsTotal: number;
  vendorsChosen: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <SummaryCard
        href={`/eventos/${eventId}/presupuesto`}
        title="Presupuesto"
        primary={formatMoney(budgetEstimated)}
        secondary={`${formatMoney(budgetActual)} gastado`}
      />
      <SummaryCard
        href={`/eventos/${eventId}/invitados`}
        title="Invitados"
        primary={`${guestsConfirmed} / ${guestsTotal}`}
        secondary="confirmados"
      />
      <SummaryCard
        href={`/eventos/${eventId}/tareas`}
        title="Tareas"
        primary={`${tasksPending}`}
        secondary={`pendientes de ${tasksTotal}`}
      />
      <SummaryCard
        href={`/eventos/${eventId}/proveedores`}
        title="Proveedores"
        primary={`${vendorsChosen} / ${vendorsTotal}`}
        secondary="elegidos"
      />
    </div>
  );
}
