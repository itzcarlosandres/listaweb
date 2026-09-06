import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { ProjectStatus } from "@prisma/client";

export const runtime = "nodejs";

export const alt = "LaunchHub Project Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  const project = await db.project.findUnique({
    where: { slug, status: ProjectStatus.APPROVED },
    include: {
      category: true,
      user: true,
    },
  });

  const projectName = project?.name || "Proyecto en LaunchHub";
  const projectTagline = project?.tagline || "Descubre los mejores productos digitales y SaaS en español";
  const categoryName = project?.category?.name || "Tecnología";
  const votesCount = project?.votesCount || 0;
  const pricingType = project?.pricingType || "FREE";
  const authorName = project?.user?.name || project?.user?.username || "Comunidad";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#17150F",
          color: "#FAF9F6",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative background gradient */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(228,87,46,0.25) 0%, rgba(23,21,15,0) 70%)",
          }}
        />

        {/* Header with Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#E4572E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "900",
                color: "#FFFFFF",
              }}
            >
              ▲
            </div>
            <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Launch<span style={{ color: "#E4572E" }}>Hub</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                backgroundColor: "#2E2B23",
                color: "#F3A712",
                padding: "8px 18px",
                borderRadius: "999px",
                fontSize: "18px",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              {categoryName}
            </span>
            <span
              style={{
                backgroundColor: "#E4572E",
                color: "#FFFFFF",
                padding: "8px 18px",
                borderRadius: "999px",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {pricingType}
            </span>
          </div>
        </div>

        {/* Center content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "950px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            {projectName}
          </h1>
          <p
            style={{
              fontSize: "28px",
              lineHeight: 1.4,
              color: "#A8A29E",
              margin: 0,
            }}
          >
            {projectTagline}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #2E2B23",
            paddingTop: "24px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px", color: "#A8A29E" }}>Creado por</span>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "#FFFFFF" }}>
              {authorName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#2E2B23",
              padding: "10px 24px",
              borderRadius: "16px",
            }}
          >
            <span style={{ fontSize: "22px", color: "#E4572E" }}>▲</span>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#FFFFFF" }}>
              {votesCount}
            </span>
            <span style={{ fontSize: "18px", color: "#A8A29E" }}>votos en LaunchHub</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
