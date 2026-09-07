import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getRelatedProjects,
  getPopularPaidProjects,
} from "@/server/services/project-service";
import { VoteButton } from "@/components/project/VoteButton";
import { FavoriteButton } from "@/components/project/FavoriteButton";
import { ShareButton } from "@/components/project/ShareButton";
import { VisitButton } from "@/components/project/VisitButton";
import { ReportModal } from "@/components/project/ReportModal";
import { ProjectViewTracker } from "@/components/project/ProjectViewTracker";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { TagChip } from "@/components/shared/TagChip";
import { TechnologyBadge } from "@/components/shared/TechnologyBadge";
import { ProjectCard } from "@/components/project/ProjectCard";
import { PromotedSidebarProjects } from "@/components/project/PromotedSidebarProjects";
import { CommentSection } from "@/components/comment/CommentSection";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  Eye,
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Proyecto no encontrado | LaunchHub" };

  return {
    title: `${project.name} — ${project.tagline} | LaunchHub`,
    description: project.description.slice(0, 160),
    openGraph: {
      title: `${project.name} en LaunchHub`,
      description: project.tagline,
      images: project.screenshots.length > 0 ? [project.screenshots[0]] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: project.tagline,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [related, popularPaid] = await Promise.all([
    getRelatedProjects(project.categoryId, project.id, 3),
    getPopularPaidProjects(4, project.id),
  ]);

  const popularPaidIds = new Set(popularPaid.map((p) => p.id));
  const filteredRelated = related.filter((r) => !popularPaidIds.has(r.id));

  const formattedLaunchDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(project.launchDate));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.description,
    applicationCategory: project.category.name,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: project.pricingType === "FREE" ? "0" : undefined,
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: Math.max(1, project.votesCount),
    },
    author: {
      "@type": "Person",
      name: project.user.name || project.user.username,
      url: `https://launchhub.dev/user/${project.user.username}`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Tracker no bloqueante de vistas */}
      <ProjectViewTracker projectId={project.id} />

      {/* 1. HERO DEL PROYECTO */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xs space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo + Información principal */}
          <div className="flex items-start gap-5 min-w-0 flex-1">
            {project.logoUrl ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#E7E4DB] dark:border-[#2E2B23] bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E4572E] text-white font-bold text-2xl flex items-center justify-center shrink-0">
                {project.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
                  {project.name}
                </h1>
                <CategoryBadge
                  slug={project.category.slug}
                  name={project.category.name}
                  icon={project.category.icon}
                  size="md"
                />
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {project.pricingType}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {project.projectType}
                </span>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
                {project.tagline}
              </p>

              <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap pt-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Launched on {formattedLaunchDate}
                </span>
                {project.country && <span>Country: {project.country}</span>}
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  {project.viewsCount} views
                </span>
              </div>
            </div>
          </div>

          {/* Voto Gigante Hero & Acciones */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <VoteButton
              projectId={project.id}
              initialVotesCount={project.votesCount}
              initialHasVoted={project.hasVoted}
              size="hero"
            />
          </div>
        </div>

        {/* Barra de Acciones: Visitar Web, Favorito, Compartir, Reportar */}
        <div className="pt-6 border-t border-[#E7E4DB] dark:border-[#2E2B23] flex flex-wrap items-center justify-end gap-3">
          <VisitButton
            projectId={project.id}
            websiteUrl={project.websiteUrl}
            name={project.name}
          />
          <FavoriteButton
            projectId={project.id}
            initialHasFavorited={project.hasFavorited}
          />
          <ShareButton
            title={project.name}
            url={project.websiteUrl}
            tagline={project.tagline}
          />
          <ReportModal
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>

      {/* 2. CUERPO PRINCIPAL (2 Columnas: Galería + Detalles / Sidebar Maker) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Columna Izquierda: Descripción y Detalles (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Descripción en detalle */}
          <div className="space-y-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23]">
            <h2 className="font-display font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6]">
              About {project.name}
            </h2>
            <div className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4 whitespace-pre-line font-normal">
              {project.description}
            </div>
          </div>

          {/* Tags y Tecnologías */}
          <div className="space-y-4 p-6 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23]">
            <h3 className="font-display font-bold text-sm text-[#17150F] dark:text-[#FAF9F6]">
              Specifications & Tech Stack
            </h3>

            {project.technologies.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                  Technologies Used:
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(({ technology }) => (
                    <TechnologyBadge
                      key={technology.id}
                      slug={technology.slug}
                      name={technology.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(({ tag }) => (
                    <TagChip key={tag.id} slug={tag.slug} name={tag.name} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sección de Comentarios Anidados */}
          <CommentSection
            projectId={project.id}
            projectOwnerId={project.user.id}
          />
        </div>

        {/* Columna Derecha: Proyectos Populares de Pago + Relacionados (4 cols) */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          {/* Proyectos Populares de Pago (Solo los que pagan) */}
          <PromotedSidebarProjects projects={popularPaid} />

          {/* Proyectos Relacionados */}
          {filteredRelated.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-[#17150F] dark:text-[#FAF9F6]">
                More in {project.category.name}
              </h3>
              <div className="space-y-3">
                {filteredRelated.map((rel) => (
                  <ProjectCard key={rel.id} project={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
