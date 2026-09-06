import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserRoleActions } from "@/components/admin/UserRoleActions";
import { Users, Search, FolderGit2, MessageSquare, ThumbsUp, Calendar } from "lucide-react";

interface UsersAdminPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function UsersAdminPage({ searchParams }: UsersAdminPageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  const { q } = await searchParams;

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: {
        select: {
          projects: true,
          votes: true,
          comments: true,
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
              Comunidad
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Directorio de Miembros
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Gestión de Usuarios ({users.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Administra roles, planes PRO y accesos de los miembros de la comunidad.
          </p>
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por nombre, @username o email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </form>
      </div>

      <div className="bg-white dark:bg-[#16140F] rounded-2xl border border-[#E8E5DC] dark:border-[#25221B] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-[#E8E5DC] dark:border-[#25221B] text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Proyectos</th>
                <th className="py-3 px-4 text-center">Votos</th>
                <th className="py-3 px-4 text-center">Comentarios</th>
                <th className="py-3 px-4">Registro</th>
                <th className="py-3 px-4 text-right">Rol / Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    No se encontraron usuarios con ese criterio.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative flex-shrink-0 border border-[#E8E5DC] dark:border-[#25221B]">
                          {u.image ? (
                            <Image src={u.image} alt={u.name || u.username} fill className="object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-xs">
                              {(u.name || u.username)[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/user/${u.username}`}
                            target="_blank"
                            className="font-bold text-neutral-900 dark:text-white hover:text-[#E4572E] transition-colors block leading-tight"
                          >
                            {u.name || u.username}
                          </Link>
                          <span className="text-[11px] text-neutral-400 font-mono">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
                        {u._count.projects}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        <ThumbsUp className="w-3.5 h-3.5 text-neutral-400" />
                        {u._count.votes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                        {u._count.comments}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {new Date(u.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <UserRoleActions userId={u.id} currentRole={u.role} currentPlan={u.plan} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
