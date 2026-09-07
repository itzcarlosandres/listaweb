import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate hourly so new submissions appear automatically

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Resolve production base URL dynamically from DB or environment
  let baseUrl = "https://launchhub.dev";
  try {
    const siteSetting = await db.systemSetting.findUnique({
      where: { key: "SITE_URL" },
    });
    if (siteSetting?.value?.trim()) {
      baseUrl = siteSetting.value.trim();
    } else if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL.trim();
    } else if (process.env.NEXTAUTH_URL?.trim()) {
      baseUrl = process.env.NEXTAUTH_URL.trim();
    }
  } catch {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
  }

  // Strip trailing slash and ensure protocol
  baseUrl = baseUrl.replace(/\/+$/, "");
  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

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
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    // Dynamic project routes (all approved and published projects)
    const projects = await db.project.findMany({
      where: { status: ProjectStatus.APPROVED },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50000,
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
      take: 10000,
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
