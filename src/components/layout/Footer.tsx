import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import { CATEGORIES_SEED } from "@/lib/constants";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getGeneralSeoSettings } from "@/server/actions/admin";

export async function Footer() {
  const brandSettings = await getGeneralSeoSettings();
  const popularCategories = CATEGORIES_SEED.slice(0, 6);

  return (
    <footer className="border-t border-[#E7E4DB] dark:border-[#2E2B23] bg-white dark:bg-[#16140F] mt-auto">
      {/* Demo Data Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live platform for builders and early adopters to discover next-gen products.</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandLogo
                mode={brandSettings.logoMode}
                logoUrl={brandSettings.logoUrl}
                iconName={brandSettings.logoIcon}
                text={brandSettings.logoText}
                textHighlight={brandSettings.logoTextHighlight}
                iconBg={brandSettings.logoIconBg}
                size="md"
              />
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              {brandSettings.siteTagline ||
                "The definitive launchpad for creators, founders, and indie hackers to launch products and gain real community traction."}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Active moderation & anti-spam
              </span>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-display font-bold text-sm text-[#17150F] dark:text-[#FAF9F6] mb-3">
              Popular Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {popularCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navegación y Enlaces */}
          <div>
            <h3 className="font-display font-bold text-sm text-[#17150F] dark:text-[#FAF9F6] mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/explore"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors"
                >
                  Explore Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors"
                >
                  Daily Trending
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors"
                >
                  Plans & Boosts
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors"
                >
                  Submit Product
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {brandSettings.siteName || "LaunchHub"} Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#E4572E] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#E4572E] transition-colors">
              Privacy
            </Link>
            <Link href="/guidelines" className="hover:text-[#E4572E] transition-colors">
              Community Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
