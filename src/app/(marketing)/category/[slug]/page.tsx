import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getExploreProjects } from "@/server/services/ranking-service";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return { title: "Categoría no encontrada | LaunchHub" };

  return {
    title: `Mejores proyectos y herramientas de ${category.name} | LaunchHub`,
    description: category.description || `Descubre las mejores herramientas de ${category.name} en LaunchHub.`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const page = search.page ? parseInt(search.page, 10) : 1;

  const category = await db.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const { items, totalCount, totalPages, hasNextPage, hasPrevPage, currentPage } =
    await getExploreProjects({
      category: slug,
      page,
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Back */}
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#E4572E] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a todas las categorías
      </Link>

      {/* Hero Categoría */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center shrink-0">
            <CategoryIcon name={category.icon} className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
                {category.name}
              </h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {totalCount} proyectos
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              {category.description || `Explora las soluciones más votadas y recientes dentro de la categoría ${category.name}.`}
            </p>
          </div>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Publicar en {category.name}
        </Link>
      </div>

      {/* Grid de Proyectos */}
      {items.length > 0 ? (
        <ProjectGrid projects={items} />
      ) : (
        <EmptyState
          title={`Aún no hay proyectos en ${category.name}`}
          description="Sé el primero en lanzar tu proyecto dentro de esta categoría y obtén máxima visibilidad."
          actionText="Publicar Proyecto"
          actionHref="/submit"
        />
      )}

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
