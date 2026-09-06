import { ProjectSubmitWizard } from "@/components/project/ProjectSubmitWizard";
import { Sparkles, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar Proyecto Gratis | LaunchHub",
  description: "Publica tu SaaS, startup, app o herramienta en LaunchHub en 4 sencillos pasos. Publicación 100% gratuita.",
};

export default function SubmitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Publicación 100% Gratuita (Sin Tarjeta)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verificación y Aprobación Previa
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Lanza tu producto al mundo
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Comparte tu startup, SaaS, web o herramienta con la comunidad. Todos los envíos son revisados por el equipo antes de publicarse para garantizar calidad.
        </p>
      </div>

      {/* Wizard */}
      <ProjectSubmitWizard />
    </div>
  );
}
