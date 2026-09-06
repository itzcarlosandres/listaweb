import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let allowIndexing = true;
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ["SEO_ALLOW_INDEXING", "SITE_URL"],
        },
      },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    if (map.has("SEO_ALLOW_INDEXING")) {
      allowIndexing = map.get("SEO_ALLOW_INDEXING") === "true";
    }
    if (map.has("SITE_URL") && map.get("SITE_URL")) {
      baseUrl = map.get("SITE_URL")!;
    }
  } catch {
    // fallback if db is unavailable
  }

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/dashboard", "/dashboard/", "/api", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
