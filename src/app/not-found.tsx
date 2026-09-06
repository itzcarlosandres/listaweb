import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6] dark:bg-[#12110D] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-[#17150F] dark:text-[#FAF9F6]">
            Página no encontrada (404)
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            El proyecto, perfil o enlace que buscas no existe o ha sido trasladado a otra dirección.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Explorar proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
