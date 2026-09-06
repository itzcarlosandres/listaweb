import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getGeneralSeoSettings,
  getRankingSettings,
  getPaymentGatewaySettings,
  getSmtpSettings,
} from "@/server/actions/admin";
import { AdminSettingsTabs } from "@/components/admin/AdminSettingsTabs";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  const [seoSettings, rankingSettings, paymentSettings, smtpSettings] = await Promise.all([
    getGeneralSeoSettings(),
    getRankingSettings(),
    getPaymentGatewaySettings(),
    getSmtpSettings(),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
            Sistema
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-xs font-mono text-neutral-400">
            Parámetros Globales
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
          Configuración del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Ajustes globales organizados por pestañas: marca & SEO, algoritmo de ranking, pasarelas de pago, moderación e infraestructura.
        </p>
      </div>

      {/* Tabs Layout */}
      <AdminSettingsTabs
        seoSettings={seoSettings}
        rankingSettings={rankingSettings}
        paymentSettings={paymentSettings}
        smtpSettings={smtpSettings}
      />
    </div>
  );
}
