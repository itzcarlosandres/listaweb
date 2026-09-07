import type { Metadata } from "next";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { Users, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGeneralSeoSettings();
  return {
    title: `Community Guidelines | ${seo.siteName || "ListaWEB"}`,
    description: `Standards, submission etiquette, and community rules for ${seo.siteName || "ListaWEB"}.`,
  };
}

export default async function GuidelinesPage() {
  const seo = await getGeneralSeoSettings();
  const brand = seo.siteName || "ListaWEB";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left border-b border-[#E7E4DB] dark:border-[#2E2B23] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Community Standards</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Community Guidelines
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          How we keep {brand} transparent, supportive, and focused on genuine innovation.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E4572E]" />
            1. What Belongs on {brand}
          </h2>
          <p>
            {brand} is built for authentic technology launches. We celebrate tools that solve real problems or demonstrate creative engineering, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li>SaaS products, web applications, and developer utilities.</li>
            <li>AI tools, generative workflows, and open-source packages.</li>
            <li>Mobile apps, creative design tools, and indie hacker projects.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            2. Prohibited Content &amp; Behaviors
          </h2>
          <p>
            To protect our users and maintain high discovery quality, we strictly forbid:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li><strong>Fake or deceptive software:</strong> Malicious links, phishing schemes, and crypto scams.</li>
            <li><strong>Vote manipulation:</strong> Buying votes, using bots, or creating sockpuppet accounts.</li>
            <li><strong>Harassment:</strong> Abusive commentary, hate speech, or defamatory attacks in comments.</li>
            <li><strong>Duplicate listings:</strong> Submitting the exact same landing page repeatedly without substantial updates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6] flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            3. Constructive Feedback &amp; Respect
          </h2>
          <p>
            Building products is hard work. When leaving comments or reviewing a fellow builder&apos;s product, please share constructive, respectful, and actionable feedback. Treat other makers with kindness and encouragement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            4. Reporting Violations
          </h2>
          <p>
            If you encounter a project, comment, or user profile that breaches these guidelines, please use the built-in &quot;Report&quot; button on the product page. Our moderation team reviews all flagged items promptly.
          </p>
        </section>
      </div>
    </div>
  );
}
