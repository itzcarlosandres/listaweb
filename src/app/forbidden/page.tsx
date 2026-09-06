import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-[#12110D] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-[#17150F] dark:text-[#FAF9F6]">
            Acceso Denegado (403)
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No tienes los permisos necesarios de administrador para acceder a esta sección.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-[#17150F] text-[#FAF9F6] dark:bg-[#FAF9F6] dark:text-[#17150F] hover:opacity-90 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
