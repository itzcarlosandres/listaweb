import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaunchHub — Descubre lo que están construyendo",
  description: "La plataforma SaaS comunitaria para descubrir, votar y publicar startups, proyectos, herramientas y productos digitales.",
  keywords: ["startups", "saas", "proyectos", "product hunt", "lanzamientos", "herramientas ia", "open source"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] dark:bg-[#12110D] text-[#17150F] dark:text-[#FAF9F6]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
