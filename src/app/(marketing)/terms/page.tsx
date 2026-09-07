import type { Metadata } from "next";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { ShieldCheck, FileText, Scale } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGeneralSeoSettings();
  return {
    title: `Terms of Service | ${seo.siteName || "ListaWEB"}`,
    description: `Terms of Service and user agreement for ${seo.siteName || "ListaWEB"}.`,
  };
}

export default async function TermsPage() {
  const seo = await getGeneralSeoSettings();
  const brand = seo.siteName || "ListaWEB";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left border-b border-[#E7E4DB] dark:border-[#2E2B23] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last updated: September 2026 • Effective immediately for all visitors and creators.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using {brand} (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            2. Platform Purpose &amp; Submissions
          </h2>
          <p>
            {brand} is an open discovery platform and showcase directory designed for makers, indie developers, and startups to present software tools, SaaS, and digital applications.
          </p>
          <p>
            When submitting a product or creating a project listing, you affirm that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li>You own the rights to the product or are authorized to represent it.</li>
            <li>The content provided is truthful, accurate, and does not contain malicious code, malware, or deceptive claims.</li>
            <li>Your listing does not violate third-party intellectual property or copyright laws.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            3. Voting, Reviews &amp; Anti-Spam Policy
          </h2>
          <p>
            We take ranking authenticity seriously. Any attempt to artificially manipulate upvotes, create automated bot accounts, or post fraudulent reviews will result in immediate disqualification and removal of the listing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            4. Paid Services &amp; Promoted Listings
          </h2>
          <p>
            Optional premium services such as Boosts, Pro maker subscriptions, and featured slots are processed securely through authorized payment gateways. Digital promotion services take effect immediately upon confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            5. Termination &amp; Moderation
          </h2>
          <p>
            We reserve the right to modify, unlist, or suspend any project, review, or account that breaches community standards, spreads illegal material, or threatens user safety.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            6. Contact &amp; Inquiries
          </h2>
          <p>
            For legal questions, DMCA notifications, or general inquiries regarding these Terms, please reach out via our community guidelines or official platform contact channels.
          </p>
        </section>
      </div>
    </div>
  );
}
