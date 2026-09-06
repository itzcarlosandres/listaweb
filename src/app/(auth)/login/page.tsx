import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { Sparkles, Star } from "lucide-react";

export default async function LoginPage() {
  const brandSettings = await getGeneralSeoSettings();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F6] dark:bg-[#12110D]">
      {/* Columna Izquierda: Branding y Testimonio */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#17150F] text-[#FAF9F6] relative overflow-hidden">
        {/* Fondo sutil con gradiente */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E4572E]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <BrandLogo
              mode={brandSettings.logoMode}
              logoUrl={brandSettings.logoUrl}
              iconName={brandSettings.logoIcon}
              text={brandSettings.logoText}
              textHighlight={brandSettings.logoTextHighlight}
              iconBg={brandSettings.logoIconBg}
              size="lg"
            />
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-xl font-medium leading-relaxed">
            &ldquo;Publicamos en {brandSettings.siteName || "LaunchHub"} el primer día y conseguimos más de 1,200 visitas calificadas y nuestros primeros clientes de pago.&rdquo;
          </blockquote>
          <div>
            <div className="font-bold text-base">Elena Rostova</div>
            <div className="text-sm text-neutral-400">Creadora de Software</div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {brandSettings.siteName || "LaunchHub"} Inc.</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E4572E]" />
            Impulsando la nueva generación de creadores
          </span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Login */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Logo en versión móvil */}
          <div className="lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <BrandLogo
                mode={brandSettings.logoMode}
                logoUrl={brandSettings.logoUrl}
                iconName={brandSettings.logoIcon}
                text={brandSettings.logoText}
                textHighlight={brandSettings.logoTextHighlight}
                iconBg={brandSettings.logoIconBg}
                size="md"
              />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-[#17150F] dark:text-[#FAF9F6]">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Ingresa tus credenciales para acceder a tu panel de control.
            </p>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-xl" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-xs text-neutral-500">
            ¿No tienes cuenta aún?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#E4572E] hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
