import type { Metadata } from "next";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { ShieldCheck, Lock } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGeneralSeoSettings();
  return {
    title: `Privacy Policy | ${seo.siteName || "ListaWEB"}`,
    description: `Privacy policy and data protection practices for ${seo.siteName || "ListaWEB"}.`,
  };
}

export default async function PrivacyPage() {
  const seo = await getGeneralSeoSettings();
  const brand = seo.siteName || "ListaWEB";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left border-b border-[#E7E4DB] dark:border-[#2E2B23] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Privacy &amp; Protection</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last updated: September 2026 • We respect and protect your personal information.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            1. Information We Collect
          </h2>
          <p>
            When you register on {brand}, publish a product, or engage with our community, we collect necessary account data including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li><strong>Account details:</strong> Name, username, email address, and avatar image.</li>
            <li><strong>Product listings:</strong> Project title, URLs, media screenshots, pricing tier, and category tags.</li>
            <li><strong>Usage analytics:</strong> Anonymous page views, votes cast, and general device telemetry to improve performance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            2. How We Use Your Information
          </h2>
          <p>
            The collected information is used strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li>Display your public creator profile and showcase your digital products to our global audience.</li>
            <li>Send transactional emails regarding project review status, approvals, and order receipts.</li>
            <li>Prevent spam, automated voting abuse, and protect community integrity.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            3. Data Sharing &amp; Third Parties
          </h2>
          <p>
            We do not sell, rent, or trade your personal data with third-party advertisers. We only interface with reputable service providers (e.g., payment gateways and authenticated SMTP delivery services) to fulfill platform operations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            4. Cookies &amp; Local Storage
          </h2>
          <p>
            We utilize secure session cookies to remember authentication tokens and user interface preferences such as light or dark appearance mode.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            5. Your Rights &amp; Data Deletion
          </h2>
          <p>
            You have full control over your account. You may request your project listings to be updated, unlisted, or your account data to be permanently erased by contacting platform administrators.
          </p>
        </section>
      </div>
    </div>
  );
}
