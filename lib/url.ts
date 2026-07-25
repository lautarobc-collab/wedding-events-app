import { headers } from "next/headers";

// En producción, NEXT_PUBLIC_SITE_URL (si está definida) manda sobre las
// cabeceras de la petición — evita construir enlaces de confirmación a
// partir de un Host/X-Forwarded-Host que, en teoría, un proxy mal
// configurado podría dejar manipular.
export async function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol =
    headersList.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
