import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { PAGE_SIZE } from "@/lib/constants";
import { calculateTrendingScore } from "@/lib/rank";
import type { ProjectWithDetails, PricingType } from "@/types";

export interface ExploreFilters {
  query?: string;
  category?: string;
  pricing?: PricingType;
  tag?: string;
  tech?: string;
  sort?: "trending" | "top-today" | "top-week" | "top-month" | "newest" | "most-viewed";
  page?: number;
}

export async function getCachedRankings(period: "today" | "week" | "month", limit = 50) {
  const fetchRankings = unstable_cache(
    async () => {
      const now = new Date();
      let windowDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h por defecto
      if (period === "week") {
        windowDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "month") {
        windowDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Proyectos aprobados con votos en la ventana
      const projects = await db.project.findMany({
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
          votes: {
            where: { createdAt: { gte: windowDate } },
            select: { id: true },
          },
        },
        orderBy: [
          { votesCount: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });

      // Ordenar por número de votos en la ventana y desempate por total votesCount
      const sorted = projects.sort((a, b) => {
        const votesA = a.votes.length;
        const votesB = b.votes.length;
        if (votesB !== votesA) return votesB - votesA;
        return b.votesCount - a.votesCount;
      });

      return sorted.map((p) => ({
        ...p,
        screenshots: (p.screenshots as string[]) || [],
        periodVotesCount: p.votes.length,
      }));
    },
    [`rankings-${period}-${limit}`],
    { revalidate: 60, tags: ["rankings"] }
  );

  const data = await fetchRankings();

  // Adjuntar hasVoted del usuario actual si está logueado
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return data.map((p) => ({ ...p, hasVoted: false, hasFavorited: false })) as ProjectWithDetails[];
  }

  const userVotes = await db.projectVote.findMany({
    where: {
      userId: currentUserId,
      projectId: { in: data.map((p) => p.id) },
    },
    select: { projectId: true },
  });
  const votedSet = new Set(userVotes.map((v) => v.projectId));

  const userFavs = await db.favorite.findMany({
    where: {
      userId: currentUserId,
      projectId: { in: data.map((p) => p.id) },
    },
    select: { projectId: true },
  });
  const favSet = new Set(userFavs.map((f) => f.projectId));

  return data.map((p) => ({
    ...p,
    hasVoted: votedSet.has(p.id),
    hasFavorited: favSet.has(p.id),
  })) as ProjectWithDetails[];
}

export async function getTrendingRankingsFull(limit = 50) {
  const fetchTrending = unstable_cache(
    async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const projects = await db.project.findMany({
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
          votes: {
            where: { createdAt: { gte: oneDayAgo } },
            select: { id: true },
          },
          comments: {
            where: { createdAt: { gte: oneDayAgo }, status: "VISIBLE" },
            select: { id: true },
          },
          favorites: {
            where: { createdAt: { gte: oneDayAgo } },
            select: { id: true },
          },
          views: {
            where: { createdAt: { gte: oneDayAgo } },
            select: { id: true },
          },
        },
        take: 100,
      });

      // Calcular score de trending por proyecto
      const scored = projects.map((p) => {
        const score = calculateTrendingScore({
          votes24h: p.votes.length,
          comments24h: p.comments.length,
          favorites24h: p.favorites.length,
          views24h: p.views.length,
          launchDate: p.launchDate,
        });

        return {
          ...p,
          trendingScore: score,
          screenshots: (p.screenshots as string[]) || [],
        };
      });

      // Ordenar por score descendente
      scored.sort((a, b) => b.trendingScore - a.trendingScore || b.votesCount - a.votesCount);

      return scored.slice(0, limit);
    },
    [`trending-full-${limit}`],
    { revalidate: 60, tags: ["rankings"] }
  );

  const data = await fetchTrending();

  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return data.map((p) => ({ ...p, hasVoted: false, hasFavorited: false })) as ProjectWithDetails[];
  }

  const userVotes = await db.projectVote.findMany({
    where: {
      userId: currentUserId,
      projectId: { in: data.map((p) => p.id) },
    },
    select: { projectId: true },
  });
  const votedSet = new Set(userVotes.map((v) => v.projectId));

  const userFavs = await db.favorite.findMany({
    where: {
      userId: currentUserId,
      projectId: { in: data.map((p) => p.id) },
    },
    select: { projectId: true },
  });
  const favSet = new Set(userFavs.map((f) => f.projectId));

  return data.map((p) => ({
    ...p,
    hasVoted: votedSet.has(p.id),
    hasFavorited: favSet.has(p.id),
  })) as ProjectWithDetails[];
}

export async function getExploreProjects(filters: ExploreFilters) {
  const page = Math.max(1, filters.page || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const session = await auth();
  const currentUserId = session?.user?.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "APPROVED",
  };

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.pricing) {
    where.pricingType = filters.pricing;
  }

  if (filters.tag) {
    where.tags = {
      some: { tag: { slug: filters.tag } },
    };
  }

  if (filters.tech) {
    const techSlug = filters.tech.toLowerCase().replace(/[^a-z0-9]/g, "-");
    where.technologies = {
      some: { technology: { slug: techSlug } },
    };
  }

  if (filters.query) {
    const q = filters.query.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  // Orden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = [{ votesCount: "desc" }, { createdAt: "desc" }];

  if (filters.sort === "newest") {
    orderBy = [{ createdAt: "desc" }];
  } else if (filters.sort === "most-viewed") {
    orderBy = [{ viewsCount: "desc" }, { votesCount: "desc" }];
  }

  const [totalCount, projects] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({
      where,
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
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const items = projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
