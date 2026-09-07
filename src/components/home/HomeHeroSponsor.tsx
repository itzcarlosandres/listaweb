"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Crown,
  Sparkles,
} from "lucide-react";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import type { ProjectWithDetails } from "@/types";

interface HomeHeroSponsorProps {
  sponsors: ProjectWithDetails[];
}

export function HomeHeroSponsor({ sponsors }: HomeHeroSponsorProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    sponsors.length > 0 ? Math.floor(Math.random() * sponsors.length) : 0
  );
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (sponsors.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 6500); // Rota suavemente cada 6.5s

    return () => clearInterval(timer);
  }, [sponsors.length, isPaused]);

  // Si no hay sponsors activos: Banner horizontal 100% ancho y altura compacta
  if (!sponsors || sponsors.length === 0) {
    return (
      <div className="w-full relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-[#1D1810] dark:via-[#16140F] dark:to-[#12110D] shadow-sm px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs shrink-0">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Sponsor</span>
            </span>

            <div className="min-w-0 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 truncate">
              <span className="font-bold text-neutral-900 dark:text-white">
                Reserve the #1 Spotlight on LaunchHub:
              </span>{" "}
              <span className="text-neutral-600 dark:text-neutral-400">
                Full-width 30 days homepage exposure for your product.
              </span>
            </div>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-[#E4572E] to-amber-600 text-white hover:opacity-95 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>Claim Spot ($149 USD)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const currentSponsor = sponsors[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % sponsors.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full relative rounded-2xl overflow-hidden border border-amber-500/35 bg-gradient-to-r from-amber-500/[0.08] via-white to-amber-500/[0.08] dark:from-[#1D1810] dark:via-[#16140F] dark:to-[#12110D] shadow-md transition-all text-left px-4 sm:px-6 py-3 sm:py-3.5"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Lado Izquierdo: Insignia + Logo + Nombre + Tagline + Categoría */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full lg:w-auto">
          {/* Badge VIP Oficial */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs shrink-0">
            <Crown className="w-3 h-3 fill-current" />
            <span>Sponsor</span>
          </span>

          {/* Logo del proyecto (compacto 44x44) */}
          <Link href={`/project/${currentSponsor.slug}`} className="shrink-0 group">
            {currentSponsor.logoUrl ? (
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-amber-500/25 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSponsor.logoUrl}
                  alt={currentSponsor.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E4572E] to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs group-hover:scale-105 transition-transform">
                {currentSponsor.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </Link>

          {/* Información: Título, Tagline y Categoría en línea */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/project/${currentSponsor.slug}`}
                className="font-heading font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors truncate"
              >
                {currentSponsor.name}
              </Link>

              {currentSponsor.category && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
                  <CategoryIcon name={currentSponsor.category.icon} className="w-3 h-3 text-[#E4572E]" />
                  <span>{currentSponsor.category.name}</span>
                </span>
              )}

              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Featured
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate mt-0.5 max-w-2xl">
              {currentSponsor.tagline}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Controles de rotación si hay varios + Botones de Acción */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-[#E7E4DB] dark:border-[#2E2B23]">
          {sponsors.length > 1 && (
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 px-2 py-1 rounded-lg border border-amber-500/20 text-xs font-mono text-neutral-500">
              <button
                onClick={handlePrev}
                aria-label="Previous sponsor"
                className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 px-0.5 text-[11px]">
                {currentIndex + 1}/{sponsors.length}
              </span>
              <button
                onClick={handleNext}
                aria-label="Next sponsor"
                className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href={`/project/${currentSponsor.slug}`}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl font-semibold text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span>Details</span>
            </Link>

            {currentSponsor.websiteUrl && (
              <a
                href={currentSponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 px-4 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#E4572E] to-amber-600 text-white hover:opacity-95 transition-all shadow-xs"
              >
                <span>Visit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
