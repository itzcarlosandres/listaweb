import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    // Ping PostgreSQL database
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: "healthy",
          latencyMs: latency,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al conectar con la base de datos";
    return NextResponse.json(
      {
        status: "unhealthy",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
