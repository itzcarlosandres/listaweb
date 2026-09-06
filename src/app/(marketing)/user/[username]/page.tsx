import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FollowButton } from "@/components/user/FollowButton";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Calendar,
  Globe,
  MapPin,
  Sparkles,
  ShieldCheck,
  FolderGit2,
  Users,
  Heart,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";
import type { ProjectWithDetails } from "@/types";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await db.user.findUnique({
    where: { username },
    select: { name: true, username: true, bio: true },
  });

  if (!user) return { title: "Usuario no encontrado | LaunchHub" };

  return {
    title: `${user.name || user.username} (@${user.username}) — Perfil en LaunchHub`,
    description: user.bio || `Conoce los proyectos y lanzamientos creados por @${user.username} en LaunchHub.`,
  };
}

export default async function UserProfilePage({ params }: UserPageProps) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const user = await db.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          projects: { where: { status: "APPROVED" } },
          followers: true,
          following: true,
        },
      },
      projects: {
        where: { status: "APPROVED" },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
              plan: true,
            },
          },
          tags: { include: { tag: true } },
          technologies: { include: { technology: true } },
          votes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
          favorites: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Comprobar si el usuario actual sigue a este usuario
  let isFollowing = false;
  if (currentUserId && currentUserId !== user.id) {
    const followRecord = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    });
    isFollowing = Boolean(followRecord);
  }

  // Calcular total de votos recibidos
  const totalVotesReceived = user.projects.reduce((acc, p) => acc + p.votesCount, 0);

  const formattedProjects: ProjectWithDetails[] = user.projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  }));

  const formattedJoinedDate = new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. HEADER PERFIL DE USUARIO */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          {/* Avatar e Identidad */}
          <div className="flex items-start gap-5">
            <UserAvatar
              src={user.image}
              name={user.name || user.username}
              size="xl"
              className="w-20 h-20 sm:w-24 sm:h-24 text-2xl"
            />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
                  {user.name || user.username}
                </h1>
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </span>
                )}
                {user.plan === "PRO" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pro Maker
                  </span>
                )}
              </div>

              <p className="text-sm font-mono text-neutral-400">@{user.username}</p>

              {user.bio && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed pt-1">
                  {user.bio}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap pt-2">
                {user.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {user.country}
                  </span>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#E4572E] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Se unió en {formattedJoinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Botón Seguir */}
          <div className="shrink-0 self-start sm:self-auto">
            <FollowButton
              targetUserId={user.id}
              initialIsFollowing={isFollowing}
              size="md"
            />
          </div>
        </div>

        {/* Barra de Estadísticas */}
        <div className="pt-6 border-t border-[#E7E4DB] dark:border-[#2E2B23] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-[#FAF9F6] dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23]">
            <span className="font-mono font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6] block">
              {user._count.projects}
            </span>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
              Proyectos
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF9F6] dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23]">
            <span className="font-mono font-extrabold text-xl text-[#E4572E] block">
              {totalVotesReceived}
            </span>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
              Votos Recibidos
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF9F6] dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23]">
            <span className="font-mono font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6] block">
              {user._count.followers}
            </span>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
              Seguidores
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF9F6] dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23]">
            <span className="font-mono font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6] block">
              {user._count.following}
            </span>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
              Siguiendo
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROYECTOS DEL MAKER */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#E4572E]" />
            <h2 className="font-display font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6]">
              Proyectos Publicados ({formattedProjects.length})
            </h2>
          </div>
        </div>

        {formattedProjects.length > 0 ? (
          <ProjectGrid projects={formattedProjects} />
        ) : (
          <EmptyState
            title="Aún no ha publicado proyectos"
            description="Este usuario aún no tiene lanzamientos aprobados en la plataforma."
          />
        )}
      </div>
    </div>
  );
}
