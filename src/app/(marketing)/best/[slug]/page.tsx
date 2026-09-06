import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getExploreProjects } from "@/server/services/ranking-service";
import { ProjectRow } from "@/components/project/ProjectRow";
import { Award, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface BestPageProps {
  params: Promise<{ slug: string }>;
}

const ALIAS_MAP: Record<string, { name: string; categorySlug?: string; description: string }> = {
  saas: {
    name: "Best Software as a Service (SaaS)",
    categorySlug: "saas",
    description: "Up-to-date ranking of top SaaS applications and platforms built by the community.",
  },
  "ai-tools": {
    name: "Best Artificial Intelligence (AI) Tools",
    categorySlug: "ai",
    description: "The definitive selection of top-voted AI tools, agents, and models.",
  },
  websites: {
    name: "Best Websites & Landing Pages",
    categorySlug: "websites",
    description: "Inspiration and curated directory of top independent websites.",
  },
  startups: {
    name: "Best Emerging Startups",
    description: "High-growth indie startups and side-projects with strong community traction.",
  },
  tools: {
    name: "Best Developer Tools",
    categorySlug: "developer-tools",
    description: "Essential utilities, libraries, and extensions for software developers.",
  },
};

export async function generateStaticParams() {
  return [
    { slug: "saas" },
    { slug: "ai-tools" },
    { slug: "websites" },
    { slug: "startups" },
    { slug: "tools" },
  ];
}

export async function generateMetadata({ params }: BestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const alias = ALIAS_MAP[slug];
  const title = alias ? `${alias.name} | LaunchHub` : `Best Projects in ${slug} | LaunchHub`;
  const description = alias ? alias.description : `Discover the top projects on LaunchHub.`;

  return { title, description };
}

export default async function BestAliasesPage({ params }: BestPageProps) {
  const { slug } = await params;
  const alias = ALIAS_MAP[slug] || {
    name: `Best projects: ${slug.replace(/-/g, " ")}`,
    description: "Community ranking based on verified votes and real reviews.",
  };

  const { items } = await getExploreProjects({
    category: alias.categorySlug,
    sort: "trending",
    page: 1,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-[#E4572E]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/20 text-[#E4572E] border border-[#E4572E]/30">
            <Award className="w-3.5 h-3.5" />
            Curated Official Ranking
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight">
            {alias.name}
          </h1>
          <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
            {alias.description}
          </p>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {items.map((project, idx) => (
          <ProjectRow key={project.id} project={project} rankIndex={idx + 1} />
        ))}
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-8 border-t border-[#E7E4DB] dark:border-[#2E2B23] space-y-3">
        <p className="text-sm text-neutral-500">
          Have a project that fits this category?
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm"
        >
          Submit my project for free
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
