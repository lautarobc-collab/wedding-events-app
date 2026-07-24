import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">Coordina</h1>
        <p className="text-sm text-neutral-600">
          Inicia sesión para gestionar tus eventos.
        </p>
      </div>

      <LoginForm />

      <p className="text-sm text-neutral-600">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/register" className="underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
