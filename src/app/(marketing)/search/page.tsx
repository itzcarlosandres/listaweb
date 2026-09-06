import { db } from "@/lib/db";
import { ProjectStatus } from "@prisma/client";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Buscar "${q}" | LaunchHub` : "Buscador de Proyectos | LaunchHub",
    description: "Encuentra herramientas, SaaS, apps y startups digitales.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const rawProjects = query
    ? await db.project.findMany({
        where: {
          status: ProjectStatus.APPROVED,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tagline: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          user: true,
          technologies: {
            include: { technology: true },
          },
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { votesCount: "desc" },
        take: 30,
      })
    : [];

  const projects = rawProjects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: false,
    hasFavorited: false,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search Bar */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold font-heading text-neutral-950 dark:text-white">
          Buscador de Productos & Startups
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Explora cientos de herramientas, software independiente y aplicaciones en español.
        </p>

        <form method="GET" className="relative mt-4">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre, nicho o tecnología (ej. 'IA', 'Notion', 'CRM')..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </form>
      </div>

      {/* Results */}
      <div>
        {query ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Mostrando <strong>{projects.length}</strong> resultados para &ldquo;
                <span className="text-primary font-medium">{query}</span>&rdquo;
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#1E1C16] rounded-2xl border border-[#E7E4DB] dark:border-[#2E2B23]">
                <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                  No se encontraron proyectos para &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Prueba con términos más generales o explora por categoría.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Explorar todo el catálogo
                </Link>
              </div>
            ) : (
              <ProjectGrid projects={projects} />
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-neutral-500">
            Introduce un término de búsqueda arriba o presiona <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs border border-[#E7E4DB] dark:border-[#2E2B23]">⌘K</kbd> en cualquier momento.
          </div>
        )}
      </div>
    </div>
  );
}
