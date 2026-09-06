import { db } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users,
  FolderGit2,
  Inbox,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  Eye,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalProjects,
    pendingProjects,
    approvedProjects,
    rejectedProjects,
    totalVotes,
    totalComments,
    openReports,
    totalViews,
    paymentsPaid,
    recentActions,
  ] = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.project.count({ where: { status: "PENDING" } }),
    db.project.count({ where: { status: "APPROVED" } }),
    db.project.count({ where: { status: "REJECTED" } }),
    db.projectVote.count(),
    db.comment.count(),
    db.report.count({ where: { status: "OPEN" } }),
    db.projectView.count(),
    db.payment.findMany({ where: { status: "PAID" }, select: { amountCents: true } }),
    db.adminAction.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { name: true, username: true } },
      },
    }),
  ]);

  const totalRevenueCents = paymentsPaid.reduce((acc, p) => acc + p.amountCents, 0);
  const totalRevenueUsd = (totalRevenueCents / 100).toFixed(2);

  const primaryKpis = [
    {
      title: "Volumen de Ingresos",
      value: `$${totalRevenueUsd}`,
      subtext: "NOWPayments & Stripe",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      href: "/admin/payments",
      trend: "Pasarela activa",
    },
    {
      title: "Envíos por Moderar",
      value: pendingProjects,
      subtext: pendingProjects > 0 ? "Requiere revisión" : "Bandeja al día",
      icon: Inbox,
      color: pendingProjects > 0 ? "text-[#E4572E] bg-[#E4572E]/10" : "text-emerald-600 bg-emerald-500/10",
      href: "/admin/submissions",
      alert: pendingProjects > 0,
      trend: pendingProjects > 0 ? "Atención requerida" : "Completado",
    },
    {
      title: "Proyectos Aprobados",
      value: approvedProjects,
      subtext: `${totalProjects} registrados en total`,
      icon: FolderGit2,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      href: "/admin/projects",
      trend: "Catálogo público",
    },
    {
      title: "Comunidad de Usuarios",
      value: totalUsers,
      subtext: "Creadores y votantes",
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
      href: "/admin/users",
      trend: "Miembros activos",
    },
  ];

  const secondaryKpis = [
    { title: "Votos Totales", value: totalVotes, icon: ThumbsUp, subtext: "Interacciones comunitarias" },
    { title: "Comentarios", value: totalComments, icon: MessageSquare, subtext: "Feedback en lanzamientos" },
    { title: "Visualizaciones", value: totalViews, icon: Eye, subtext: "Tráfico de proyectos" },
    {
      title: "Reportes Abiertos",
      value: openReports,
      icon: AlertTriangle,
      subtext: openReports > 0 ? "Denuncias pendientes" : "Sin incidentes",
      alert: openReports > 0,
      href: "/admin/reports",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DC] dark:border-[#25221B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Dashboard
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Vista Ejecutiva
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Panel de Control
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
            Supervisa en tiempo real la tracción de usuarios, la cola de moderación y la monetización de LaunchHub.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingProjects > 0 ? (
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-xs"
            >
              <Inbox className="w-4 h-4" />
              <span>Moderar {pendingProjects} Envíos</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Moderación al día</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const CardWrapper = kpi.href ? Link : "div";

          return (
            <CardWrapper
              key={idx}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={kpi.href as any}
              className={`p-5 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs transition-all flex flex-col justify-between group ${
                kpi.href
                  ? "hover:border-[#E4572E]/40 dark:hover:border-[#E4572E]/40 hover:shadow-xs cursor-pointer"
                  : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {kpi.title}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white block tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-xs text-neutral-500 block truncate">
                    {kpi.subtext}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E5DC]/60 dark:border-[#25221B]/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>{kpi.trend}</span>
                {kpi.href && (
                  <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-[#E4572E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {secondaryKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const CardWrapper = kpi.href ? Link : "div";

          return (
            <CardWrapper
              key={idx}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={(kpi.href || "") as any}
              className={`p-4 rounded-xl bg-white/60 dark:bg-[#16140F]/60 border border-[#E8E5DC] dark:border-[#25221B] flex items-center gap-3 transition-colors ${
                kpi.href ? "hover:border-[#E4572E]/40 cursor-pointer" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  kpi.alert
                    ? "bg-red-500/10 text-red-600"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-neutral-500 block truncate">
                  {kpi.title}
                </span>
                <span className="font-heading font-bold text-base text-neutral-900 dark:text-white block">
                  {kpi.value}
                </span>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Moderation Alerts Split (Only if pending items exist) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/submissions"
          className="p-5 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] hover:border-[#E4572E]/50 transition-all flex items-center justify-between gap-4 group shadow-2xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white group-hover:text-[#E4572E] transition-colors">
                  Cola de Envíos Pendientes
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    pendingProjects > 0
                      ? "bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {pendingProjects} en cola
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Revisa y aprueba nuevos proyectos enviados por los usuarios antes de su publicación.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E4572E] group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          href="/admin/reports"
          className="p-5 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] hover:border-red-500/50 transition-all flex items-center justify-between gap-4 group shadow-2xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white group-hover:text-red-500 transition-colors">
                  Centro de Moderación y Reportes
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    openReports > 0
                      ? "bg-red-500/10 text-red-600 border border-red-500/20"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {openReports} abiertos
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Supervisa denuncias de spam, contenido duplicado o enlaces rotos en la comunidad.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </div>

      {/* Auditoría de Acciones de Moderación */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[#E4572E]" />
            <h2 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
              Registro de Actividad y Auditoría (AdminAction)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Últimos eventos
          </span>
        </div>

        {recentActions.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No se registran acciones de moderación recientes.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
            {recentActions.map((action) => (
              <div key={action.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 ${
                      action.action === "APPROVE"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : action.action === "REJECT" || action.action === "SUSPEND"
                        ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                        : action.action === "FEATURE"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {action.action}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 truncate font-medium">
                    {action.detail || `Acción sobre ${action.targetType} (${action.targetId})`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-neutral-400 text-[11px] font-mono">
                  <span>por @{action.admin.username}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(action.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
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
