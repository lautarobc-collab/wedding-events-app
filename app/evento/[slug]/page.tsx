import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PublicEventInfo = {
  event_name: string;
  event_date: string | null;
  location: string | null;
};

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_event_info", { p_slug: slug });
  const info = (data as PublicEventInfo[] | null)?.[0];
  if (error || !info) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">{info.event_name}</h1>
      </div>

      <dl className="flex flex-col gap-4">
        <div>
          <dt className="text-sm text-neutral-500 dark:text-neutral-400">Fecha</dt>
          <dd className="font-medium">{info.event_date ?? "Todavía sin definir"}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-500 dark:text-neutral-400">Ubicación</dt>
          <dd className="font-medium">{info.location ?? "Todavía sin definir"}</dd>
        </div>
      </dl>
    </main>
  );
}
