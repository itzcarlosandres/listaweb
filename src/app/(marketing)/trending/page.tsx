import { getTrendingRankingsFull } from "@/server/services/ranking-service";
import { ProjectRow } from "@/components/project/ProjectRow";
import { RankingNavTabs } from "@/components/ranking/RankingNavTabs";
import { Flame, Sparkles } from "lucide-react";

export const revalidate = 60;

export default async function TrendingPage() {
  const projects = await getTrendingRankingsFull(50);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
          <Flame className="w-4 h-4" />
          <span>Algoritmo de Momentum en Tiempo Real</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Proyectos Trending
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Clasificación ponderada por votos recientes, favoritos, visitas y comentarios de las últimas 24 horas con decaimiento temporal.
        </p>

        <RankingNavTabs />
      </div>

      {/* Lista de Filas */}
      <div className="space-y-3">
        {projects.map((project, idx) => (
          <ProjectRow key={project.id} project={project} rankIndex={idx + 1} />
        ))}
      </div>
    </div>
  );
}
