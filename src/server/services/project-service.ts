import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ProjectWithDetails } from "@/types";

export async function getTrendingProjects(limit = 6): Promise<ProjectWithDetails[]> {
  const session = await auth();
  const currentUserId = session?.user?.id;

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
      votes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      favorites: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
    orderBy: [
      { votesCount: "desc" },
      { viewsCount: "desc" },
    ],
    take: limit,
  });

  return projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];
}

export async function getPaidAndFeaturedProjects(limit = 6): Promise<ProjectWithDetails[]> {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const now = new Date();

  const projects = await db.project.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { boostedUntil: { gt: now } },
        { featured: true },
        { user: { plan: "PRO" } },
      ],
    },
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
    orderBy: [
      { boostedUntil: "desc" },
      { featured: "desc" },
      { votesCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  return projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];
}

export async function getCommunityFreeProjects(limit = 12): Promise<ProjectWithDetails[]> {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const now = new Date();

  const projects = await db.project.findMany({
    where: {
      status: "APPROVED",
      featured: false,
      user: { plan: "FREE" },
      OR: [
        { boostedUntil: null },
        { boostedUntil: { lte: now } },
      ],
    },
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
    orderBy: [
      { votesCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  return projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];
}

export async function getTodayLaunches(limit = 6): Promise<ProjectWithDetails[]> {
  const session = await auth();
  const currentUserId = session?.user?.id;

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
      votes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      favorites: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];
}

export async function getRankingByPeriod(
  period: "today" | "week" | "month",
  limit = 5
): Promise<ProjectWithDetails[]> {
  const session = await auth();
  const currentUserId = session?.user?.id;

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
      votes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      favorites: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
    orderBy: [
      { votesCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  return projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];
}

export async function getCategoriesWithCounts() {
  return await db.category.findMany({
    include: {
      _count: {
        select: {
          projects: {
            where: { status: "APPROVED" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithDetails | null> {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const project = await db.project.findUnique({
    where: { slug },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          website: true,
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
  });

  if (!project) return null;

  return {
    ...project,
    screenshots: (project.screenshots as string[]) || [],
    hasVoted: Boolean(project.votes && project.votes.length > 0),
    hasFavorited: Boolean(project.favorites && project.favorites.length > 0),
  } as ProjectWithDetails;
}

export async function getRelatedProjects(categoryId: string, excludeId: string, limit = 3): Promise<ProjectWithDetails[]> {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const projects = await db.project.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      status: "APPROVED",
    },
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
    orderBy: { votesCount: "desc" },
    take: limit,
  });

  return projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  })) as ProjectWithDetails[];
}
