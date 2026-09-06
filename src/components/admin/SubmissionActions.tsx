"use client";

import { useState, useTransition } from "react";
import { approveProject, rejectProject } from "@/server/actions/admin";
import { Check, X, Loader2, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SubmissionActionsProps {
  projectId: string;
  projectName: string;
}

export function SubmissionActions({ projectId, projectName }: SubmissionActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveProject(projectId);
      if (!res.success) {
        toast.error(res.error || "No se pudo aprobar el proyecto");
      } else {
        toast.success(`Proyecto "${projectName}" aprobado exitosamente`);
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Por favor ingresa un motivo para el rechazo");
      return;
    }

    startTransition(async () => {
      const res = await rejectProject(projectId, rejectReason.trim());
      if (!res.success) {
        toast.error(res.error || "No se pudo rechazar el proyecto");
      } else {
        toast.success(`Proyecto "${projectName}" rechazado y usuario notificado`);
        setShowRejectModal(false);
        setRejectReason("");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
          Aprobar
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
          Rechazar
        </button>

        <Link
          href={`/dashboard/projects/${projectId}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300 hover:border-[#E4572E] transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar
        </Link>
      </div>

      {/* Modal de Rechazo con Motivo */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-red-600">
              Rechazar Proyecto: {projectName}
            </h3>
            <p className="text-xs text-neutral-500">
              Indica claramente el motivo del rechazo. Esta explicación se enviará directamente como notificación al creador del proyecto:
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ej: El enlace oficial no es accesible / La descripción es demasiado breve..."
                rows={3}
                required
                className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-red-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Procesando..." : "Confirmar Rechazo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
