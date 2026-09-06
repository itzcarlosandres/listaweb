import Link from "next/link";
import { db } from "@/lib/db";
import { CryptoCheckoutButton } from "@/components/payment/CryptoCheckoutButton";
import { Check, Sparkles, Zap, Rocket, Star, ArrowRight, Coins, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Planes y Precios Transparentes | LaunchHub",
  description: "Publica gratis tu SaaS, app o web sin costos ocultos. Opciones de visibilidad y planes para makers con soporte de pago en cripto.",
};

export default async function PricingPage() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
  });

  const proProduct = products.find((p) => p.kind === "PRO_SUBSCRIPTION") || products[0];
  const boost7Product = products.find((p) => p.kind === "BOOST_7");
  const boost30Product = products.find((p) => p.kind === "BOOST_30");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E]">
          <Sparkles className="w-3.5 h-3.5" />
          Precios Transparentes para la Comunidad
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Publicar siempre será{" "}
          <span className="text-[#E4572E]">100% Gratis</span>.
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          En LaunchHub creemos en dar visibilidad democrática a todos los proyectos. No necesitas pagar nada para conseguir tus primeros usuarios y votos.
        </p>
      </div>

      {/* Planes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Plan FREE (Protagonista) */}
        <div className="rounded-3xl bg-white dark:bg-[#1A1813] border-2 border-[#E4572E] p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4572E] text-white">
              Popular & Recomendado
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6]">
                Plan Free (Comunidad)
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Todo lo que necesitas para lanzar y validar cualquier proyecto.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-5xl text-[#17150F] dark:text-[#FAF9F6]">$0</span>
              <span className="text-sm text-neutral-500 font-medium">/ para siempre</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
              <div className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                <span><strong>Hasta 1 proyecto publicado</strong> en el directorio</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                <span>Página de proyecto completa con enlaces y capturas</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                <span>Perfil público de creador básico</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-400 dark:text-neutral-500 line-through">
                <span>Participación en rankings y leaderboards (Exclusivo PRO)</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-400 dark:text-neutral-500 line-through">
                <span>Analítica histórica extendida y gráficos (Solo 7 días básicos)</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-400 dark:text-neutral-500 line-through">
                <span>Insignia dorada, comentarios fijados y CTA personalizado</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md shadow-[#E4572E]/25"
            >
              <Rocket className="w-4 h-4" />
              Publicar 1 Proyecto Gratis
            </Link>
          </div>
        </div>

        {/* Plan PRO con NOWPayments */}
        <div className="rounded-3xl bg-neutral-50 dark:bg-[#14120E] border-2 border-amber-500/40 p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Desbloquea Todo
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6]">
                  {proProduct ? proProduct.name : "Plan Pro Maker"}
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Herramientas avanzadas de visibilidad, rankings y analítica para creadores serios.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-5xl text-neutral-900 dark:text-white">
                ${proProduct ? (proProduct.priceCents / 100).toFixed(0) : "19"}
              </span>
              <span className="text-sm text-neutral-500 font-medium">/ mes</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
              {[
                "Publicación de proyectos ilimitados",
                "Participación activa en Rankings diarios, semanales y mensuales",
                "Insignia PRO dorada en tu perfil y comentarios",
                "Historial de analítica extendido a 90 días + gráficos",
                "Botones de llamada a la acción (CTA) personalizados en tus proyectos",
                "Comentarios fijados y prioridad en respuestas",
                "Prioridad en la cola de revisión y aprobación",
                "Pagos instantáneos en cripto con NOWPayments y tarjeta",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-neutral-800 dark:text-neutral-200">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>{feat}</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            {proProduct ? (
              <CryptoCheckoutButton
                productId={proProduct.id}
                buttonText="Obtener Plan Pro con Cripto"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-md flex items-center justify-center gap-2"
              />
            ) : (
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-neutral-900 text-white"
              >
                Iniciar Sesión para Activar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Banda Boosts Disponibles */}
      <div className="rounded-3xl bg-[#17150F] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#2E2B23]">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-lg text-white">
              Impulsa tu Proyecto con Boosts de Visibilidad
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Adquiere paquetes de Boost temporal (7 o 30 días) para sumar puntuación directa en el algoritmo y destacar en los primeros lugares con pagos seguros en criptomoneda vía NOWPayments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/dashboard/projects"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Gestionar mis Proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
