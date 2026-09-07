"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateGeneralSeoSettings, type GeneralSeoSettingsInput } from "@/server/actions/admin";
import {
  Globe,
  Sparkles,
  Save,
  Image as ImageIcon,
  Search,
  Share2,
  BarChart3,
  Rocket,
  Flame,
  Zap,
  Compass,
  Layers,
  Bot,
  Code,
  Terminal,
  Cpu,
  Star,
  Shield,
  Target,
  Gem,
  Type,
  Layout,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface SeoSettingsFormProps {
  initialSettings: GeneralSeoSettingsInput;
}

const AVAILABLE_ICONS = [
  { id: "Rocket", label: "Cohete", icon: Rocket },
  { id: "Flame", label: "Fuego", icon: Flame },
  { id: "Sparkles", label: "Brillo", icon: Sparkles },
  { id: "Zap", label: "Rayo", icon: Zap },
  { id: "Globe", label: "Mundo", icon: Globe },
  { id: "Compass", label: "Brújula", icon: Compass },
  { id: "Layers", label: "Capas", icon: Layers },
  { id: "Bot", label: "Bot IA", icon: Bot },
  { id: "Code", label: "Código", icon: Code },
  { id: "Terminal", label: "Consola", icon: Terminal },
  { id: "Cpu", label: "Chip", icon: Cpu },
  { id: "Star", label: "Estrella", icon: Star },
  { id: "Shield", label: "Escudo", icon: Shield },
  { id: "Target", label: "Diana", icon: Target },
  { id: "Gem", label: "Gema", icon: Gem },
];

const PRESET_COLORS = [
  { label: "Naranja Launch", value: "#E4572E" },
  { label: "Índigo SaaS", value: "#6366F1" },
  { label: "Azul Pro", value: "#3B82F6" },
  { label: "Esmeralda", value: "#10B981" },
  { label: "Ámbar Fuego", value: "#F59E0B" },
  { label: "Púrpura IA", value: "#8B5CF6" },
  { label: "Rosa Vibrante", value: "#EC4899" },
  { label: "Negro Ejecutivo", value: "#17150F" },
];

export function SeoSettingsForm({ initialSettings }: SeoSettingsFormProps) {
  const [settings, setSettings] = useState<GeneralSeoSettingsInput>({
    siteName: initialSettings?.siteName || "LaunchHub",
    siteTagline: initialSettings?.siteTagline || "",
    siteUrl: initialSettings?.siteUrl || "http://localhost:3000",
    logoMode: initialSettings?.logoMode || "text_icon",
    logoIcon: initialSettings?.logoIcon || "Rocket",
    logoText: initialSettings?.logoText || "Launch",
    logoTextHighlight: initialSettings?.logoTextHighlight || "Hub",
    logoIconBg: initialSettings?.logoIconBg || "#E4572E",
    logoUrl: initialSettings?.logoUrl || "",
    faviconUrl: initialSettings?.faviconUrl || "",
    ogImageUrl: initialSettings?.ogImageUrl || "",
    metaTitle: initialSettings?.metaTitle || "",
    metaDescription: initialSettings?.metaDescription || "",
    metaKeywords: initialSettings?.metaKeywords || "",
    twitterHandle: initialSettings?.twitterHandle || "",
    googleAnalyticsId: initialSettings?.googleAnalyticsId || "",
    googleSiteVerification: initialSettings?.googleSiteVerification || "",
    allowIndexing: initialSettings?.allowIndexing ?? true,
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateGeneralSeoSettings(settings);
      if (res.success) {
        toast.success("Configuración de Marca, Logo y SEO guardada con éxito");
        router.refresh();
      } else {
        toast.error(res.error || "Error al guardar configuración");
      }
    });
  };

  // Icon component resolution
  const SelectedIcon =
    AVAILABLE_ICONS.find((i) => i.id === settings.logoIcon)?.icon || Rocket;

  // Live SEO Preview calculations
  const displayTitle = settings.metaTitle || `${settings.siteName || "LaunchHub"} — ${settings.siteTagline || "Lanzamientos"}`;
  const displayDescription =
    settings.metaDescription ||
    "Explora diariamente nuevas herramientas de IA, SaaS, aplicaciones y startups creadas por desarrolladores y emprendedores.";
  const displayDomain = (() => {
    try {
      const rawUrl = settings.siteUrl || "http://localhost:3000";
      const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      return url.hostname;
    } catch {
      return "listabeta.com";
    }
  })();

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4572E]/10 flex items-center justify-center text-[#E4572E]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-neutral-900 dark:text-white">
                Identidad de Marca, Logo & SEO
              </h2>
              <p className="text-xs text-neutral-500">
                Personaliza la marca, formato del logo (Texto + Ícono o Imagen), posicionamiento en buscadores y redes sociales.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#E4572E]/90 transition-all inline-flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Cambios SEO
          </button>
        </div>

        {/* SECTION 1: Brand & Logo Presentation */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold font-heading uppercase tracking-wider text-neutral-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-[#E4572E]" />
            <span>1. Formato y Presentación del Logo</span>
          </div>

          {/* Logo Format Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Text + Icon */}
            <button
              type="button"
              onClick={() => setSettings({ ...settings, logoMode: "text_icon" })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                settings.logoMode === "text_icon"
                  ? "border-[#E4572E] bg-[#E4572E]/5 dark:bg-[#E4572E]/10 ring-1 ring-[#E4572E]"
                  : "border-[#E8E5DC] dark:border-[#25221B] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E4572E] text-white flex items-center justify-center shadow-xs">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Texto + Ícono</span>
                </div>
                {settings.logoMode === "text_icon" && (
                  <span className="w-4 h-4 rounded-full bg-[#E4572E] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Ícono dinámico + nombre con sufijo resaltado. Moderno y personalizable.
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                Recomendado
              </span>
            </button>

            {/* Option 2: Image Logo */}
            <button
              type="button"
              onClick={() => setSettings({ ...settings, logoMode: "image" })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                settings.logoMode === "image"
                  ? "border-[#E4572E] bg-[#E4572E]/5 dark:bg-[#E4572E]/10 ring-1 ring-[#E4572E]"
                  : "border-[#E8E5DC] dark:border-[#25221B] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Logo en Imagen</span>
                </div>
                {settings.logoMode === "image" && (
                  <span className="w-4 h-4 rounded-full bg-[#E4572E] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Carga tu logotipo vectorizado en formato SVG, PNG o WebP desde una URL.
              </p>
            </button>

            {/* Option 3: Text Only */}
            <button
              type="button"
              onClick={() => setSettings({ ...settings, logoMode: "text" })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                settings.logoMode === "text"
                  ? "border-[#E4572E] bg-[#E4572E]/5 dark:bg-[#E4572E]/10 ring-1 ring-[#E4572E]"
                  : "border-[#E8E5DC] dark:border-[#25221B] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                    <Type className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Solo Texto</span>
                </div>
                {settings.logoMode === "text" && (
                  <span className="w-4 h-4 rounded-full bg-[#E4572E] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Muestra únicamente el texto de la marca con tipografía limpia y minimalista.
              </p>
            </button>
          </div>

          {/* Conditional Options based on logoMode */}
          {settings.logoMode === "text_icon" && (
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-[#E8E5DC]/80 dark:border-[#25221B]/80 space-y-5 animate-in fade-in duration-200">
              {/* Icon Selector Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>Seleccionar Ícono del Logo</span>
                  <span className="text-[11px] font-mono text-[#E4572E] font-bold">
                    Ícono actual: {settings.logoIcon || "Rocket"}
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconCmp = item.icon;
                    const isSelected = (settings.logoIcon || "Rocket") === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSettings({ ...settings, logoIcon: item.id })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer gap-1.5 ${
                          isSelected
                            ? "bg-[#E4572E] text-white border-[#E4572E] shadow-xs scale-105"
                            : "bg-white dark:bg-[#16140F] text-neutral-700 dark:text-neutral-300 border-[#E8E5DC] dark:border-[#25221B] hover:border-neutral-400"
                        }`}
                        title={item.label}
                      >
                        <IconCmp className="w-4 h-4" />
                        <span className="text-[10px] font-medium truncate w-full text-center">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Texto Base (Prefijo)
                  </label>
                  <input
                    type="text"
                    value={settings.logoText || ""}
                    onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                    placeholder="Ej. Launch"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Texto Destacado (Color Primario)
                  </label>
                  <input
                    type="text"
                    value={settings.logoTextHighlight || ""}
                    onChange={(e) => setSettings({ ...settings, logoTextHighlight: e.target.value })}
                    placeholder="Ej. Hub"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Color del Contenedor del Ícono
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.logoIconBg || "#E4572E"}
                      onChange={(e) => setSettings({ ...settings, logoIconBg: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-lg border border-[#E8E5DC] dark:border-[#25221B] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.logoIconBg || "#E4572E"}
                      onChange={(e) => setSettings({ ...settings, logoIconBg: e.target.value })}
                      placeholder="#E4572E"
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-neutral-500 font-medium">Paleta de colores rápidos para el ícono:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSettings({ ...settings, logoIconBg: c.value })}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] text-[11px] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {settings.logoMode === "image" && (
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-[#E8E5DC]/80 dark:border-[#25221B]/80 space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>URL del Archivo de Logotipo</span>
                  <span className="text-[10px] text-neutral-400">SVG recomendado, PNG o WebP</span>
                </label>
                <input
                  type="text"
                  value={settings.logoUrl || ""}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="/brand/logo.svg o https://tusitio.com/logo.png"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {settings.logoMode === "text" && (
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-[#E8E5DC]/80 dark:border-[#25221B]/80 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Texto Base
                  </label>
                  <input
                    type="text"
                    value={settings.logoText || ""}
                    onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                    placeholder="Ej. Launch"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Texto Destacado
                  </label>
                  <input
                    type="text"
                    value={settings.logoTextHighlight || ""}
                    onChange={(e) => setSettings({ ...settings, logoTextHighlight: e.target.value })}
                    placeholder="Ej. Hub"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LIVE NAVBAR LOGO PREVIEW (Light & Dark) */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold font-heading uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#E4572E]" />
              <span>Vista Previa del Logo en la Barra de Navegación</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Preview */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E7E4DB] shadow-2xs space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Modo Claro
                </span>
                <div className="flex items-center gap-2.5">
                  {settings.logoMode === "text_icon" && (
                    <>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-transform"
                        style={{ backgroundColor: settings.logoIconBg || "#E4572E" }}
                      >
                        <SelectedIcon className="w-5 h-5" />
                      </div>
                      <span className="font-heading font-extrabold text-xl tracking-tight text-[#17150F]">
                        {settings.logoText || "Launch"}
                        <span style={{ color: settings.logoIconBg || "#E4572E" }}>
                          {settings.logoTextHighlight || "Hub"}
                        </span>
                      </span>
                    </>
                  )}

                  {settings.logoMode === "image" && (
                    <>
                      {settings.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.logoUrl}
                          alt="Logo Preview Light"
                          className="h-8 max-w-[180px] object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-neutral-400 text-xs italic">
                          <ImageIcon className="w-4 h-4" /> (Ingresa la URL del logo)
                        </div>
                      )}
                    </>
                  )}

                  {settings.logoMode === "text" && (
                    <span className="font-heading font-extrabold text-xl tracking-tight text-[#17150F]">
                      {settings.logoText || "Launch"}
                      <span className="text-[#E4572E]">
                        {settings.logoTextHighlight || "Hub"}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Dark Mode Preview */}
              <div className="p-4 rounded-2xl bg-[#12110D] border border-[#2E2B23] shadow-2xs space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  Modo Oscuro
                </span>
                <div className="flex items-center gap-2.5">
                  {settings.logoMode === "text_icon" && (
                    <>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-transform"
                        style={{ backgroundColor: settings.logoIconBg || "#E4572E" }}
                      >
                        <SelectedIcon className="w-5 h-5" />
                      </div>
                      <span className="font-heading font-extrabold text-xl tracking-tight text-[#FAF9F6]">
                        {settings.logoText || "Launch"}
                        <span style={{ color: settings.logoIconBg || "#E4572E" }}>
                          {settings.logoTextHighlight || "Hub"}
                        </span>
                      </span>
                    </>
                  )}

                  {settings.logoMode === "image" && (
                    <>
                      {settings.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.logoUrl}
                          alt="Logo Preview Dark"
                          className="h-8 max-w-[180px] object-contain filter brightness-110"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-neutral-600 text-xs italic">
                          <ImageIcon className="w-4 h-4" /> (Ingresa la URL del logo)
                        </div>
                      )}
                    </>
                  )}

                  {settings.logoMode === "text" && (
                    <span className="font-heading font-extrabold text-xl tracking-tight text-[#FAF9F6]">
                      {settings.logoText || "Launch"}
                      <span className="text-[#E4572E]">
                        {settings.logoTextHighlight || "Hub"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Favicon & OG Image URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Favicon URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>URL del Favicon</span>
                <span className="text-[10px] text-neutral-400">ICO o PNG (32x32)</span>
              </label>
              <input
                type="text"
                value={settings.faviconUrl || ""}
                onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                placeholder="/favicon.ico o https://..."
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>

            {/* OG Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>URL Imagen Compartir (OG)</span>
                <span className="text-[10px] text-neutral-400">1200 x 630 px</span>
              </label>
              <input
                type="text"
                value={settings.ogImageUrl || ""}
                onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                placeholder="/og-image.jpg o https://..."
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SEO Meta Tags */}
        <div className="space-y-4 pt-4 border-t border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold font-heading uppercase tracking-wider text-neutral-900 dark:text-white">
              <Search className="w-4 h-4 text-[#E4572E]" />
              <span>2. Metadatos SEO Globales (Google / Buscadores)</span>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#E4572E]/90 transition-all inline-flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Guardar Cambios SEO
            </button>
          </div>

          {/* Brand Name and Tagline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Nombre Oficial de la Plataforma
              </label>
              <input
                type="text"
                value={settings.siteName || ""}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Ej. ListaWEB o LaunchHub"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Eslogan / Tagline del Sitio
              </label>
              <input
                type="text"
                value={settings.siteTagline || ""}
                onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                placeholder="Ej. Descubre lo que están construyendo"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Meta Title Principal
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    (settings.metaTitle || "").length > 60
                      ? "text-amber-500 font-bold"
                      : "text-neutral-400"
                  }`}
                >
                  {(settings.metaTitle || "").length} / 60 caracteres
                </span>
              </div>
              <input
                type="text"
                value={settings.metaTitle || ""}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                placeholder="Ej. LaunchHub — Descubre y lanza proyectos tecnológicos"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                URL Canónica Base del Sitio
              </label>
              <input
                type="text"
                value={settings.siteUrl || ""}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                placeholder="https://listabeta.com"
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Meta Description (Descripción en Motores de Búsqueda)
              </label>
              <span
                className={`text-[10px] font-mono ${
                  (settings.metaDescription || "").length > 160
                    ? "text-amber-500 font-bold"
                    : "text-neutral-400"
                }`}
              >
                {(settings.metaDescription || "").length} / 160 caracteres
              </span>
            </div>
            <textarea
              rows={3}
              value={settings.metaDescription || ""}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              placeholder="Escribe un resumen atractivo para buscadores..."
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Palabras Clave (Keywords separadas por comas)
            </label>
            <input
              type="text"
              value={settings.metaKeywords || ""}
              onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
              placeholder="saas, startups, herramientas ia, lanzamientos, software, creadores"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
            />
          </div>

          {/* Indexing Switch */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-[#E8E5DC]/80 dark:border-[#25221B]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                Indexación en Motores de Búsqueda (Robots Tag)
              </span>
              <p className="text-[11px] text-neutral-500">
                {settings.allowIndexing
                  ? "index, follow — Google y otros buscadores rastrearán e indexarán todas las páginas públicas."
                  : "noindex, nofollow — Bloquea el rastreo de buscadores (Útil para entornos de desarrollo/mantenimiento)."}
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.allowIndexing}
                onChange={(e) => setSettings({ ...settings, allowIndexing: e.target.checked })}
                className="w-4 h-4 rounded text-[#E4572E] focus:ring-[#E4572E]"
              />
              <span
                className={`text-xs font-bold ${
                  settings.allowIndexing
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {settings.allowIndexing ? "Permitir Indexación" : "Bloquear Indexación"}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-neutral-500">
              Los cambios en el Meta Title y Description se aplican automáticamente a la página de inicio y a toda la web.
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#E4572E]/90 transition-all inline-flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Guardar Cambios SEO
            </button>
          </div>
        </div>

        {/* SECTION 3: Google SERP Live Preview */}
        <div className="space-y-3 pt-4 border-t border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-heading uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              <span>Vista Previa en Google (SERP Preview)</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">Simulación en vivo</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#12110D] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-1.5 max-w-2xl font-sans">
            <div className="flex items-center gap-2 text-xs text-[#202124] dark:text-[#bdc1c6]">
              <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                {(settings.siteName || "L").charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-neutral-900 dark:text-neutral-200 leading-none">
                  {settings.siteName || "LaunchHub"}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono leading-none mt-0.5">
                  https://{displayDomain}
                </span>
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
              {displayTitle}
            </h3>
            <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
              {displayDescription}
            </p>
          </div>
        </div>

        {/* SECTION 4: Social & Analytics */}
        <div className="space-y-4 pt-4 border-t border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="flex items-center gap-2 text-xs font-bold font-heading uppercase tracking-wider text-neutral-900 dark:text-white">
            <BarChart3 className="w-4 h-4 text-[#E4572E]" />
            <span>3. Redes Sociales y Analítica Web</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Usuario de Twitter / X
              </label>
              <input
                type="text"
                value={settings.twitterHandle || ""}
                onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                placeholder="@launchhub"
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Google Analytics ID (GA4)
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ""}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Google Search Console Token
              </label>
              <input
                type="text"
                value={settings.googleSiteVerification || ""}
                onChange={(e) => setSettings({ ...settings, googleSiteVerification: e.target.value })}
                placeholder="google-site-verification=..."
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900/80 border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:border-[#E4572E] text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Bottom Sticky-style Action Bar */}
        <div className="pt-4 border-t border-[#E8E5DC]/80 dark:border-[#25221B]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            Guarda tus cambios para que se actualice el logo, favicon, título y descripción SEO en vivo.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#E4572E]/90 transition-all inline-flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Todos los Cambios SEO
          </button>
        </div>
      </div>
    </form>
  );
}
