import Link from "next/link";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";
import { MobileNav } from "./MobileNav";
import { SearchBarModal } from "@/components/shared/SearchBarModal";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { Plus, Flame, Compass, Layers, DollarSign } from "lucide-react";
import type { SessionUser } from "@/types";

export async function Navbar() {
  const [session, brandSettings] = await Promise.all([
    auth(),
    getGeneralSeoSettings(),
  ]);

  const user = session?.user as SessionUser | undefined;

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative h-14 sm:h-16 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 bg-white/95 dark:bg-[#14120E]/95 backdrop-blur-md rounded-2xl border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xs">
        {/* Dynamic Logo & Links */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 group shrink-0">
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

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#17150F] dark:hover:text-[#FAF9F6] hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link
              href="/trending"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#17150F] dark:hover:text-[#FAF9F6] hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              Trending
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#17150F] dark:hover:text-[#FAF9F6] hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <Layers className="w-4 h-4" />
              Categories
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#17150F] dark:hover:text-[#FAF9F6] hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Pricing
            </Link>
          </nav>
        </div>

        {/* Acciones & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Search ⌘K Modal (Icon on mobile, Pill on desktop) */}
          <SearchBarModal />

          {/* ThemeToggle hidden on mobile, visible on sm+ */}
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* CTA Publicar */}
          <Link
            href="/submit"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm shadow-[#E4572E]/25 hover:shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Submit Project
          </Link>

          {/* User Nav o Login */}
          {user ? (
            <UserNav user={user} />
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] hover:text-[#E4572E] transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Navigation Drawer Trigger */}
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
