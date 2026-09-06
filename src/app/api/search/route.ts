import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProjectStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ projects: [], categories: [], users: [] });
    }

    const [projects, categories, users] = await Promise.all([
      db.project.findMany({
        where: {
          status: ProjectStatus.APPROVED,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { tagline: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          logoUrl: true,
          votesCount: true,
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { votesCount: "desc" },
        take: 6,
      }),

      db.category.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          _count: {
            select: { projects: true },
          },
        },
        take: 4,
      }),

      db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
        take: 4,
      }),
    ]);

    return NextResponse.json({ projects, categories, users });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ projects: [], categories: [], users: [] }, { status: 500 });
  }
}
