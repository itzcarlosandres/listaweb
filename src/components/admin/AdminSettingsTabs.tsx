"use client";

import { useState } from "react";
import { SeoSettingsForm } from "@/components/admin/SeoSettingsForm";
import { RankingSettingsForm } from "@/components/admin/RankingSettingsForm";
import { PaymentGatewaySettingsForm } from "@/components/admin/PaymentGatewaySettingsForm";
import { Globe, Sliders, CreditCard, Shield, Server, CheckCircle2 } from "lucide-react";
import type {
  GeneralSeoSettingsInput,
  RankingSettingsInput,
  PaymentGatewaySettingsInput,
} from "@/server/actions/admin";

interface AdminSettingsTabsProps {
  seoSettings: GeneralSeoSettingsInput;
  rankingSettings: RankingSettingsInput;
  paymentSettings: PaymentGatewaySettingsInput;
}

export function AdminSettingsTabs({
  seoSettings,
  rankingSettings,
  paymentSettings,
}: AdminSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "seo" | "ranking" | "payments" | "moderation" | "infrastructure"
  >("seo");

  const tabs = [
    {
      id: "seo" as const,
      label: "Marca, Logo & SEO",
      icon: Globe,
      description: "Logo, favicon, metadatos para buscadores, OpenGraph y analítica",
    },
    {
      id: "ranking" as const,
      label: "Algoritmo de Ranking",
      icon: Sliders,
      description: "Pesos de votos, comentarios, boost y decaimiento temporal",
    },
    {
      id: "payments" as const,
      label: "Pasarelas de Pago",
      icon: CreditCard,
      description: "NOWPayments (Cripto) y Stripe",
    },
    {
      id: "moderation" as const,
      label: "Moderación & Seguridad",
      icon: Shield,
      description: "Políticas de revisión y filtros anti-bot",
    },
    {
      id: "infrastructure" as const,
      label: "Infraestructura",
      icon: Server,
      description: "Servidores, caché y base de datos PostgreSQL",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8E5DC] dark:border-[#25221B]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#E4572E] text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "seo" && (
          <div className="space-y-4">
            <SeoSettingsForm initialSettings={seoSettings} />
          </div>
        )}

        {activeTab === "ranking" && (
          <div className="space-y-4">
            <RankingSettingsForm initialSettings={rankingSettings} />
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <PaymentGatewaySettingsForm initialSettings={paymentSettings} />
          </div>
        )}

        {activeTab === "moderation" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
              <div className="w-10 h-10 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-heading font-bold text-neutral-900 dark:text-white">
                  Políticas de Moderación y Publicación
                </h2>
                <p className="text-xs text-neutral-500">
                  Control de aprobaciones manuales, verificación de proyectos y filtros de seguridad.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60 text-xs">
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-neutral-900 dark:text-white block text-sm">
                    Revisión Manual de Nuevos Proyectos
                  </span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-xl">
                    Todos los proyectos creados ingresan con estado <span className="font-mono font-bold text-amber-600 dark:text-amber-400">PENDING</span>. No son visibles públicamente en el Home ni en el Ranking hasta ser revisados y aprobados por un administrador.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ACTIVO
                </span>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-neutral-900 dark:text-white block text-sm">
                    Protección Anti-Bot y Honeypot
                  </span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-xl">
                    Verifica el campo honeypot oculto y bloquea envíos con tiempo de llenado inferior a 3 segundos para mitigar spam automatizado.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ACTIVO
                </span>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-neutral-900 dark:text-white block text-sm">
                    Restricción Estricta para Plan Free
                  </span>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-xl">
                    Los usuarios con plan gratuito pueden publicar un máximo de 1 proyecto y tienen métricas limitadas a 7 días.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ACTIVO
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "infrastructure" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-heading font-bold text-neutral-900 dark:text-white">
                  Infraestructura y Servidores
                </h2>
                <p className="text-xs text-neutral-500">
                  Estado de la arquitectura tecnológica de LaunchHub.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/60 dark:border-[#25221B]/60 space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Motor de Base de Datos</span>
                <span className="block font-heading font-bold text-sm text-neutral-900 dark:text-white">PostgreSQL 16 (Localhost:5432)</span>
                <span className="text-xs text-neutral-500">ORM: Prisma 6 con CUID2 IDs</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/60 dark:border-[#25221B]/60 space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Framework Web</span>
                <span className="block font-heading font-bold text-sm text-neutral-900 dark:text-white">Next.js 16 (Turbopack)</span>
                <span className="text-xs text-neutral-500">Output: Standalone / App Router</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/60 dark:border-[#25221B]/60 space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Estrategia de Caché</span>
                <span className="block font-heading font-bold text-sm text-neutral-900 dark:text-white">unstable_cache (60s TTL)</span>
                <span className="text-xs text-neutral-500">Invalidación bajo demanda con tags</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E8E5DC]/60 dark:border-[#25221B]/60 space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">Autenticación</span>
                <span className="block font-heading font-bold text-sm text-neutral-900 dark:text-white">Auth.js v5 (NextAuth)</span>
                <span className="text-xs text-neutral-500">JWT Sessions + BCrypt</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
