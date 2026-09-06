import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ProjectStatus } from "@prisma/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://launchhub.dev";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/today`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/week`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/month`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // Dynamic project routes
    const projects = await db.project.findMany({
      where: { status: ProjectStatus.APPROVED },
      select: { slug: true, updatedAt: true },
      take: 5000,
    });

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${baseUrl}/project/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // Dynamic categories routes
    const categories = await db.category.findMany({
      select: { slug: true },
    });

    const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((c) => [
      {
        url: `${baseUrl}/category/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/best/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);

    // Dynamic public user profile routes
    const users = await db.user.findMany({
      where: {
        projects: {
          some: { status: ProjectStatus.APPROVED },
        },
      },
      select: { username: true, updatedAt: true },
      take: 1000,
    });

    const userRoutes: MetadataRoute.Sitemap = users.map((u) => ({
      url: `${baseUrl}/user/${u.username}`,
      lastModified: u.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...projectRoutes, ...categoryRoutes, ...userRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
