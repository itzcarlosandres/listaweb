import Link from "next/link";
import { db } from "@/lib/db";
import { CryptoCheckoutButton } from "@/components/payment/CryptoCheckoutButton";
import { Check, Sparkles, Zap, Rocket, Star, ArrowRight, Coins, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Transparent Plans & Pricing | LaunchHub",
  description: "Submit your SaaS, app or product for free with zero hidden fees. Visibility boosts and maker plans with crypto payment support.",
};

export default async function PricingPage() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
  });

  const proProduct = products.find((p) => p.kind === "PRO_SUBSCRIPTION") || products[0];
  const boost7Product = products.find((p) => p.kind === "BOOST_7");
  const boost30Product = products.find((p) => p.kind === "BOOST_30");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E]">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent Community Pricing
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Publishing will always be{" "}
          <span className="text-[#E4572E]">100% Free</span>.
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          At LaunchHub we believe in democratizing visibility for every builder. You never have to pay to get your first early users and votes.
        </p>
      </div>

      {/* Planes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Plan FREE (Protagonista) */}
        <div className="rounded-3xl bg-white dark:bg-[#1A1813] border-2 border-[#E4572E] p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4572E] text-white">
              Popular & Recommended
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6]">
                Community Free Plan
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Everything you need to launch, validate, and gain traction for any project.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-5xl text-[#17150F] dark:text-[#FAF9F6]">$0</span>
              <span className="text-sm text-neutral-500 font-medium">/ forever</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
              <div className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                <span><strong>Up to 1 published project</strong> in the directory</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                <span>Full project page with links, tags and details</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
                <span>Public creator profile</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-400 dark:text-neutral-500 line-through">
                <span>Leaderboard and ranking eligibility (PRO Exclusive)</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-400 dark:text-neutral-500 line-through">
                <span>Extended analytics history and charts (Basic 7 days only)</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-neutral-400 dark:text-neutral-500 line-through">
                <span>Golden badge, pinned comments and custom CTA button</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md shadow-[#E4572E]/25"
            >
              <Rocket className="w-4 h-4" />
              Submit 1 Project for Free
            </Link>
          </div>
        </div>

        {/* Plan PRO con NOWPayments */}
        <div className="rounded-3xl bg-neutral-50 dark:bg-[#14120E] border-2 border-amber-500/40 p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Unlock Everything
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6]">
                  {proProduct ? proProduct.name : "Pro Maker Plan"}
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Advanced visibility, leaderboard access, and analytics for serious founders.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-5xl text-neutral-900 dark:text-white">
                ${proProduct ? (proProduct.priceCents / 100).toFixed(0) : "19"}
              </span>
              <span className="text-sm text-neutral-500 font-medium">/ month</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
              {[
                "Unlimited project submissions",
                "Active participation in Daily, Weekly, and Monthly Leaderboards",
                "Golden PRO badge on your profile and comments",
                "90-day extended analytics history + charts",
                "Custom Call-to-Action (CTA) buttons on your projects",
                "Pinned comments and priority responses",
                "Instant publishing without waiting in moderation queues",
                "Instant crypto payments via NOWPayments & cards",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-neutral-800 dark:text-neutral-200">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>{feat}</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            {proProduct ? (
              <CryptoCheckoutButton
                productId={proProduct.id}
                buttonText="Get Pro Plan with Crypto"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-md flex items-center justify-center gap-2"
              />
            ) : (
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-neutral-900 text-white"
              >
                Sign In to Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Banda Boosts Disponibles */}
      <div className="rounded-3xl bg-[#17150F] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#2E2B23]">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-lg text-white">
              Accelerate Your Reach with Visibility Boosts
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Get temporary Boost packages (7 or 30 days) to add direct algorithmic ranking points and secure top feed spots with instant crypto payments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/dashboard/projects"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Manage My Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
