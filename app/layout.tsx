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
      <body className="antialiased">{children}</body>
    </html>
  );
}
