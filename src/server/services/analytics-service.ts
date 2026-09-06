import { db } from "@/lib/db";

export async function getUserProjectsAnalytics(userId: string, days = 30) {
  const userProjects = await db.project.findMany({
    where: { userId },
    select: { id: true, name: true, viewsCount: true, votesCount: true, favoritesCount: true, commentsCount: true },
  });

  const projectIds = userProjects.map((p) => p.id);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Consultar vistas agrupadas por día
  const views = await db.projectView.findMany({
    where: {
      projectId: { in: projectIds },
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
  });

  // Consultar clicks agrupados por día
  const clicks = await db.websiteClick.findMany({
    where: {
      projectId: { in: projectIds },
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
  });

  // Estructurar serie temporal diaria
  const dateMap: Record<string, { date: string; label: string; views: number; clicks: number }> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("es", { month: "short", day: "numeric" }).format(d);
    dateMap[key] = { date: key, label, views: 0, clicks: 0 };
  }

  views.forEach((v) => {
    const key = v.createdAt.toISOString().slice(0, 10);
    if (dateMap[key]) {
      dateMap[key].views += 1;
    }
  });

  clicks.forEach((c) => {
    const key = c.createdAt.toISOString().slice(0, 10);
    if (dateMap[key]) {
      dateMap[key].clicks += 1;
    }
  });

  const timeline = Object.values(dateMap);

  const totalViews = userProjects.reduce((acc, p) => acc + p.viewsCount, 0);
  const totalVotes = userProjects.reduce((acc, p) => acc + p.votesCount, 0);
  const totalFavorites = userProjects.reduce((acc, p) => acc + p.favoritesCount, 0);
  const totalComments = userProjects.reduce((acc, p) => acc + p.commentsCount, 0);
  const totalClicks = clicks.length;

  return {
    timeline,
    projects: userProjects,
    totals: {
      views: totalViews,
      votes: totalVotes,
      favorites: totalFavorites,
      comments: totalComments,
      clicks: totalClicks,
    },
  };
}
