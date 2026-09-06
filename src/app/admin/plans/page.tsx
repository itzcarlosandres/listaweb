import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { CreateProductButton, ProductActions } from "@/components/admin/ProductActions";

export default async function PlansAdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  const products = await db.product.findMany({
    orderBy: { priceCents: "asc" },
    include: {
      _count: {
        select: {
          subscriptions: true,
          payments: true,
          boosts: true,
        },
      },
    },
  });

  const subscriptions = await db.subscription.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      product: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Monetización
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Catálogo de Precios
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Planes y Productos de Monetización
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Gestiona precios, planes de suscripción y paquetes de Boost con soporte para Stripe y NOWPayments.
          </p>
        </div>
        <CreateProductButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
                  {p.kind}
                </span>
                <ProductActions product={p} />
              </div>
              <h3 className="text-base font-heading font-bold text-neutral-900 dark:text-white">
                {p.name}
              </h3>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">slug: {p.slug}</p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-heading font-extrabold text-neutral-900 dark:text-white">
                  ${(p.priceCents / 100).toFixed(2)}
                </span>
                <span className="text-xs text-neutral-500 font-mono">{p.currency}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E5DC]/60 dark:border-[#25221B]/60 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/40 dark:border-[#25221B]/40">
                <span className="block font-bold text-neutral-900 dark:text-white">
                  {p._count.subscriptions}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase">Subs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/40 dark:border-[#25221B]/40">
                <span className="block font-bold text-neutral-900 dark:text-white">
                  {p._count.payments}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase">Pagos</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/40 dark:border-[#25221B]/40">
                <span className="block font-bold text-neutral-900 dark:text-white">
                  {p._count.boosts}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase">Boosts</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#16140F] rounded-2xl border border-[#E8E5DC] dark:border-[#25221B] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <Sparkles className="w-4 h-4 text-[#E4572E]" />
          <h2 className="text-sm font-heading font-bold text-neutral-900 dark:text-white">
            Suscripciones Recientes
          </h2>
        </div>
        {subscriptions.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">No hay suscripciones registradas todavía.</p>
        ) : (
          <div className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {sub.user.name || sub.user.username}
                  </span>
                  <span className="text-xs text-neutral-400 ml-2">({sub.product.name})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {sub.status}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Hasta {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
