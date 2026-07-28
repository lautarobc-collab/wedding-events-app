import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">Coordina</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Crea una cuenta para empezar a planificar tu evento.
        </p>
      </div>

      <RegisterForm />

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
