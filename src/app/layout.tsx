import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import Script from "next/script";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGeneralSeoSettings();

  const rawUrl =
    seo.siteUrl && !seo.siteUrl.includes("localhost")
      ? seo.siteUrl.trim()
      : process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://launchhub.dev";

  const baseUrl = rawUrl.replace(/\/+$/, "");
  const normalizedUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

  const title = seo.metaTitle || `${seo.siteName} — ${seo.siteTagline}`;
  const description =
    seo.metaDescription ||
    "Explora diariamente nuevas herramientas de IA, SaaS, aplicaciones y startups creadas por desarrolladores y emprendedores.";
  const keywords = seo.metaKeywords
    ? seo.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : ["startups", "saas", "proyectos", "product hunt", "lanzamientos", "herramientas ia", "open source"];

  return {
    title: {
      default: title,
      template: `%s | ${seo.siteName || "LaunchHub"}`,
    },
    description,
    keywords,
    metadataBase: new URL(normalizedUrl),
    icons: seo.faviconUrl
      ? {
          icon: seo.faviconUrl,
          shortcut: seo.faviconUrl,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: normalizedUrl,
      siteName: seo.siteName || "LaunchHub",
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : [],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: seo.twitterHandle || "@launchhub",
      images: seo.ogImageUrl ? [seo.ogImageUrl] : [],
    },
    verification: seo.googleSiteVerification
      ? {
          google: seo.googleSiteVerification,
        }
      : undefined,
    robots: {
      index: seo.allowIndexing,
      follow: seo.allowIndexing,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seo = await getGeneralSeoSettings();

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] dark:bg-[#12110D] text-[#17150F] dark:text-[#FAF9F6]">
        <Providers>{children}</Providers>

        {seo.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seo.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
