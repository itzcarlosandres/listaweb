import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DollarSign, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function PaymentsAdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  const payments = await db.payment.findMany({
    take: 50,
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

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((acc, curr) => acc + curr.amountCents, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Finanzas
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Pasarelas de Pago
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Transacciones y Pagos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Historial de cobros, compras puntuales de Boost y renovaciones de suscripción.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 block">
              Volumen Total
            </span>
            <span className="text-base font-heading font-bold text-neutral-900 dark:text-white">
              ${(totalRevenue / 100).toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16140F] rounded-2xl border border-[#E8E5DC] dark:border-[#25221B] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-[#E8E5DC] dark:border-[#25221B] text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID Transacción</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                    No se registran transacciones todavía.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">
                      {p.id.slice(0, 10)}...
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          {p.user.name || p.user.username}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">{p.user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {p.product.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 dark:text-white">
                      ${(p.amountCents / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : p.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {p.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                        {p.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {p.status === "FAILED" && <AlertCircle className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-neutral-400 font-mono whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
