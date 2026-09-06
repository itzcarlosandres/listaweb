import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/dashboard/NotificationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Consultar proyectos relacionados para armar enlaces
  const projectIds = notifications
    .map((n) => n.projectId)
    .filter((id): id is string => Boolean(id));

  const projects = await db.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true, slug: true },
  });

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const formatted = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
    actorId: n.actorId,
    projectId: n.projectId,
    project: n.projectId ? projectMap[n.projectId] || null : null,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E4572E] uppercase tracking-wider mb-1">
          <Bell className="w-4 h-4" />
          <span>Centro de Actividad</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
          Notificaciones
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Votos, nuevos comentarios, seguidores y estado de revisión de tus proyectos.
        </p>
      </div>

      {formatted.length > 0 ? (
        <NotificationList notifications={formatted} />
      ) : (
        <EmptyState
          icon={Bell}
          title="No tienes notificaciones pendientes"
          description="Te avisaremos aquí en tiempo real cuando la comunidad interactúe con tus lanzamientos."
        />
      )}
    </div>
  );
}
