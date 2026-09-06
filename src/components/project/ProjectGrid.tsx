import { ProjectCard } from "./ProjectCard";
import type { ProjectWithDetails } from "@/types";

interface ProjectGridProps {
  projects: ProjectWithDetails[];
  featuredFirst?: boolean;
}

export function ProjectGrid({ projects, featuredFirst = false }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E7E4DB] dark:border-[#2E2B23]">
        <p className="text-sm text-neutral-500">No hay proyectos disponibles en esta vista.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project, idx) => (
        <ProjectCard
          key={project.id}
          project={project}
          featuredWide={featuredFirst && idx === 0}
        />
      ))}
    </div>
  );
}
