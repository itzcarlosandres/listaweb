import Link from "next/link";
import {
  getPaidAndFeaturedProjects,
  getCommunityFreeProjects,
  getRankingByPeriod,
  getCategoriesWithCounts,
} from "@/server/services/project-service";
import { HomeLeaderboard } from "@/components/home/HomeLeaderboard";
import { RankingTabs } from "@/components/home/RankingTabs";
import { HomeProjectList } from "@/components/home/HomeProjectList";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import {
  Rocket,
  Plus,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";

import type { Metadata } from "next";
import { getGeneralSeoSettings } from "@/server/actions/admin";

export const revalidate = 60; // 60 segundos de caché para rankings

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGeneralSeoSettings();
  const title = seo.metaTitle || `${seo.siteName} — ${seo.siteTagline}`;
  const description =
    seo.metaDescription ||
    "Explora diariamente nuevas herramientas de IA, SaaS, aplicaciones y startups creadas por desarrolladores y emprendedores.";

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : [],
    },
    twitter: {
      title,
      description,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : [],
    },
  };
}

export default async function HomePage() {
  const [paidProjects, communityProjects, topToday, topWeek, topMonth, categories] =
    await Promise.all([
      getPaidAndFeaturedProjects(8),
      getCommunityFreeProjects(15),
      getRankingByPeriod("today", 5),
      getRankingByPeriod("week", 5),
      getRankingByPeriod("month", 5),
      getCategoriesWithCounts(),
    ]);

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The premier launch platform for tech products</span>
            </div>

            {/* H1 Principal */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
              Discover what builders are{" "}
              <span className="text-[#E4572E] underline decoration-[#E4572E]/30 decoration-wavy underline-offset-8">
                launching
              </span>
              .
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
              Explore daily newly launched AI tools, SaaS products, developer apps, and startups built by founders worldwide.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                <Compass className="w-4 h-4" />
                Explore projects
              </Link>
              <Link
                href="/submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md shadow-[#E4572E]/25 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Submit my project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LEADERBOARD EN VIVO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeLeaderboard projects={topToday} />
      </section>

      {/* 3. SECCIÓN PRINCIPAL: LISTADO CON PROYECTOS DE PAGO EN LA CIMA + RANKINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Columna Izquierda (7 cols): Listado Segmentado (Pagos arriba, Gratis abajo) */}
          <div className="lg:col-span-7">
            <HomeProjectList
              paidProjects={paidProjects}
              communityProjects={communityProjects}
            />
          </div>

          {/* Columna Derecha (5 cols): Tabs de Ranking & Widget de Destacados */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <RankingTabs
              todayProjects={topToday}
              weekProjects={topWeek}
              monthProjects={topMonth}
            />

            {/* Promo Card PRO */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                  Exclusive LaunchHub Promotion
                </h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Boosted launches and PRO members claim top spots on the homepage, unlock golden badges, and amplify organic traction by up to 5x.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-xs"
              >
                <span>Explore Plans & Boosts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA BANDA OSCURA "¿HAS CONSTRUIDO ALGO?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#17150F] text-[#FAF9F6] p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#E4572E]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/20 text-[#E4572E] border border-[#E4572E]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Free Launch
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight text-white">
              Have you built an app, SaaS or tool?
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Launch your project in minutes, reach your first early users, and get real feedback without spending a dime.
            </p>
            <div className="pt-2">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-lg shadow-[#E4572E]/30 active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                Launch Project Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CATEGORÍAS POPULARES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-neutral-900 dark:text-white">
                Browse by Category
              </h2>
              <p className="text-xs text-neutral-500">
                Find the exact tools you need for your tech stack and workflow
              </p>
            </div>
          </div>

          <Link
            href="/categories"
            className="text-xs font-bold text-[#E4572E] hover:underline inline-flex items-center gap-1"
          >
            View all categories
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group p-4 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] card-hover flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 group-hover:bg-[#E4572E]/10 group-hover:text-[#E4572E] transition-colors flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
                  <CategoryIcon name={category.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-[#E4572E] transition-colors truncate">
                    {category.name}
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {category._count.projects} projects
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E4572E] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
