import { auth } from "@/lib/auth";
import { getUserProjectsAnalytics } from "@/server/services/analytics-service";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  ExternalLink,
  ChevronUp,
  Bookmark,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface AnalyticsPageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const params = await searchParams;
  const days = params.days === "7" ? 7 : 30;

  const userPlan = session?.user?.plan || "FREE";
  const effectiveDays = userPlan === "FREE" ? 7 : days;
  const analytics = await getUserProjectsAnalytics(userId, effectiveDays);

  return (
    <div className="space-y-8">
      {userPlan === "FREE" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Plan Free:</strong> Estás visualizando el histórico de 7 días. Mejora a <strong>Plan PRO</strong> para desbloquear analítica avanzada de 30 y 90 días con fuentes de tráfico.
            </span>
          </div>
          <Link
            href="/pricing"
            className="px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shrink-0"
          >
            Mejorar a PRO
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
            Analítica y Métricas de Rendimiento
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Seguimiento de visitas, clicks en enlaces y tracción en tiempo real.
          </p>
        </div>

        {/* Selector de Rango 7 / 30 días */}
        <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] self-start sm:self-auto">
          <Link
            href="/dashboard/analytics?days=7"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              days === 7
                ? "bg-white dark:bg-[#25221B] text-[#17150F] dark:text-[#FAF9F6] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Últimos 7 días
          </Link>
          <Link
            href="/dashboard/analytics?days=30"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              days === 30
                ? "bg-white dark:bg-[#25221B] text-[#17150F] dark:text-[#FAF9F6] shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Últimos 30 días
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vistas</span>
            <Eye className="w-4 h-4 text-[#E4572E]" />
          </div>
          <span className="font-mono font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6] block">
            {analytics.totals.views}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Clicks Web</span>
            <ExternalLink className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-mono font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 block">
            {analytics.totals.clicks}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Votos</span>
            <ChevronUp className="w-4 h-4 text-[#E4572E] stroke-[3]" />
          </div>
          <span className="font-mono font-extrabold text-2xl text-[#E4572E] block">
            {analytics.totals.votes}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Favoritos</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-mono font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6] block">
            {analytics.totals.favorites}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Feedback</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <span className="font-mono font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6] block">
            {analytics.totals.comments}
          </span>
        </div>
      </div>

      {/* Gráfica de Tendencia Temporal */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
              Tendencia de Vistas y Clicks Diarios
            </h2>
            <p className="text-xs text-neutral-500">
              Datos anónimos deduplicados por visitante y día
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#E4572E]">
              <span className="w-3 h-3 rounded-full bg-[#E4572E]" />
              Vistas
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Clicks Sitio Web
            </span>
          </div>
        </div>

        <AnalyticsChart data={analytics.timeline} />
      </div>

      {/* Banner Pro Plan Analytics */}
      <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-[#16140F] border border-[#E7E4DB] dark:border-[#2E2B23] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            Plan Pro (Próximamente)
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            El Plan Pro desbloqueará 90 días de historial, desglose por país y fuentes de referencia.
          </p>
        </div>

        <Link
          href="/pricing"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 transition-colors shrink-0"
        >
          Más información
        </Link>
      </div>
    </div>
  );
}
