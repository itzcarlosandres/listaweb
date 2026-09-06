import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { FolderGit2, ExternalLink } from "lucide-react";

export default async function CategoriesAdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Taxonomía
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Estructura de Navegación
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Categorías del Sistema ({categories.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Categorías activas para clasificar y organizar productos en LaunchHub.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16140F] rounded-2xl border border-[#E8E5DC] dark:border-[#25221B] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-[#E8E5DC] dark:border-[#25221B] text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Orden</th>
                <th className="py-3 px-4">Icono / Nombre</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 text-center">Proyectos</th>
                <th className="py-3 px-4 text-right">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-xs text-neutral-400">
                    {cat.order}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#E4572E]/10 flex items-center justify-center text-[#E4572E] shrink-0 border border-[#E4572E]/20">
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-500">
                    /category/{cat.slug}
                  </td>
                  <td className="py-3 px-4 text-xs text-neutral-500 max-w-xs truncate">
                    {cat.description || "Sin descripción"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#E4572E]" />
                      {cat._count.projects}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/category/${cat.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#E4572E] transition-colors font-medium"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
