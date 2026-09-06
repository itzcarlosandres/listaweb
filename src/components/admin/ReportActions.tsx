"use client";

import { useTransition } from "react";
import { resolveReport } from "@/server/actions/admin";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReportStatus } from "@prisma/client";

interface ReportActionsProps {
  reportId: string;
  status: ReportStatus;
}

export function ReportActions({ reportId, status }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (nextStatus: ReportStatus) => {
    startTransition(async () => {
      const res = await resolveReport(reportId, nextStatus);
      if (!res.success) toast.error(res.error || "No se pudo actualizar");
      else toast.success(`Reporte marcado como ${nextStatus}`);
    });
  };

  if (status !== "OPEN") {
    return (
      <span className="text-[11px] font-mono text-neutral-400">
        {status === "RESOLVED" ? "Resuelto" : "Descartado"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <button
        onClick={() => handleAction("RESOLVED")}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
        title="Marcar como resuelto / sanción aplicada"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
        Resolver
      </button>

      <button
        onClick={() => handleAction("DISMISSED")}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer"
        title="Descartar reporte (sin infracción)"
      >
        <XCircle className="w-3 h-3" />
        Descartar
      </button>
    </div>
  );
}
