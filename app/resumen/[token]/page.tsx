import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";

type PublicSummary = {
  event_name: string;
  event_date: string | null;
  budget_total: number | null;
  budget_estimated: number;
  budget_actual: number;
  guests_total: number;
  guests_confirmed: number;
  tasks_total: number;
  tasks_pending: number;
  vendors_total: number;
  vendors_chosen: number;
};

function StatCard({ title, primary, secondary }: { title: string; primary: string; secondary: string }) {
  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="mt-1 text-lg font-medium">{primary}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{secondary}</p>
    </div>
  );
}

export default async function PublicSummaryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_summary", { p_token: token });
  const summary = (data as PublicSummary[] | null)?.[0];
  if (error || !summary) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">{summary.event_name}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Resumen público, solo lectura
          {summary.event_date ? ` · ${summary.event_date}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Presupuesto"
          primary={formatMoney(summary.budget_estimated)}
          secondary={`${formatMoney(summary.budget_actual)} gastado`}
        />
        <StatCard
          title="Invitados"
          primary={`${summary.guests_confirmed} / ${summary.guests_total}`}
          secondary="confirmados"
        />
        <StatCard
          title="Tareas"
          primary={`${summary.tasks_pending}`}
          secondary={`pendientes de ${summary.tasks_total}`}
        />
        <StatCard
          title="Proveedores"
          primary={`${summary.vendors_chosen} / ${summary.vendors_total}`}
          secondary="elegidos"
        />
      </div>
    </main>
  );
}
