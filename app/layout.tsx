import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coordina",
  description: "Planificación de bodas y eventos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
