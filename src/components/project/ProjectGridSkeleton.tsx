import { ProjectCardSkeleton } from "./ProjectCardSkeleton";

interface ProjectGridSkeletonProps {
  count?: number;
  featuredFirst?: boolean;
}

export function ProjectGridSkeleton({
  count = 6,
  featuredFirst = false,
}: ProjectGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <ProjectCardSkeleton
          key={idx}
          featuredWide={featuredFirst && idx === 0}
        />
      ))}
    </div>
  );
}
