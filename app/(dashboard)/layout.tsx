import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <Link href="/" className="font-semibold">
          Coordina
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-600 underline">
            Cerrar sesión
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
