import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectSubmitWizard } from "@/components/project/ProjectSubmitWizard";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { ProjectSubmitInput } from "@/schemas/project";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await db.project.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      technologies: { include: { technology: true } },
    },
  });

  if (!project) notFound();

  const isOwner = project.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect("/forbidden");
  }

  const initialData: ProjectSubmitInput & { id: string } = {
    id: project.id,
    name: project.name,
    tagline: project.tagline,
    websiteUrl: project.websiteUrl,
    categoryId: project.category.slug,
    logoUrl: project.logoUrl || "",
    screenshots: (project.screenshots as string[]) || [],
    description: project.description,
    tags: project.tags.map((t) => t.tag.name),
    technologies: project.technologies.map((t) => t.technology.name),
    pricingType: project.pricingType,
    projectType: project.projectType,
    country: project.country || "",
    launchDate: new Date(project.launchDate).toISOString().slice(0, 10),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#E4572E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Projects
        </Link>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
          Edit Project: {project.name}
        </h1>

        {project.status === "APPROVED" && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Moderation notice:</strong> This project is already live. Modifying sensitive fields like name, tagline, or description will temporarily place it into review status to verify changes.
            </span>
          </div>
        )}
      </div>

      <ProjectSubmitWizard initialData={initialData} isEditing={true} />
    </div>
  );
}
