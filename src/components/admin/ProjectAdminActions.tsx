"use client";

import { useTransition } from "react";
import { featureProject, suspendProject } from "@/server/actions/admin";
import { Sparkles, AlertOctagon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProjectStatus } from "@prisma/client";

interface ProjectAdminActionsProps {
  projectId: string;
  projectName: string;
  isFeatured: boolean;
  status: ProjectStatus;
}

export function ProjectAdminActions({
  projectId,
  projectName,
  isFeatured,
  status,
}: ProjectAdminActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleFeature = () => {
    startTransition(async () => {
      const res = await featureProject(projectId, "HOME_HERO", 7);
      if (!res.success) toast.error(res.error || "No se pudo destacar el proyecto");
      else toast.success(`Proyecto "${projectName}" destacado en portada por 7 días`);
    });
  };

  const handleSuspend = () => {
    const reason = prompt("Indica el motivo de la suspensión:", "Infracción de términos de servicio");
    if (!reason) return;

    startTransition(async () => {
      const res = await suspendProject(projectId, reason);
      if (!res.success) toast.error(res.error || "No se pudo suspender");
      else toast.success(`Proyecto "${projectName}" suspendido`);
    });
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status === "APPROVED" && !isFeatured && (
        <button
          onClick={handleFeature}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
          title="Destacar en Home por 7 días"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Destacar
        </button>
      )}

      {status !== "SUSPENDED" && (
        <button
          onClick={handleSuspend}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          title="Suspender proyecto"
        >
          <AlertOctagon className="w-3 h-3" />
          Suspender
        </button>
      )}
    </div>
  );
}
