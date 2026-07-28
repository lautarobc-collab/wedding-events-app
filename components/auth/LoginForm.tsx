"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/app/auth/actions";
import { authSchema, type AuthFormValues } from "@/lib/validations/auth";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authSchema) });

  async function onSubmit(values: AuthFormValues) {
    setServerError(null);
    const result = await signIn(values.email, values.password);
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="rounded border border-neutral-300 dark:border-neutral-700 px-3 py-2"
        />
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-white dark:text-neutral-900 disabled:opacity-50"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
