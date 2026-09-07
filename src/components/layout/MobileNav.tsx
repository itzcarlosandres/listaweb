"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Compass,
  Flame,
  Layers,
  DollarSign,
  Plus,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { SessionUser } from "@/types";

interface MobileNavProps {
  user?: SessionUser;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/trending", label: "Trending", icon: Flame, badge: "Hot" },
    { href: "/categories", label: "Categories", icon: Layers },
    { href: "/pricing", label: "Pricing", icon: DollarSign },
  ];

  return (
    <div className="lg:hidden shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation menu"
        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-200 hover:text-[#E4572E] hover:border-[#E4572E] transition-colors shadow-2xs cursor-pointer"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {open && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setOpen(false)}
          />

          {/* Floating Dropdown Card */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 p-4 mx-3 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xl animate-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#E4572E]" : "text-neutral-500"}`} />
                    <span className="truncate">{link.label}</span>
                    {link.badge && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#E7E4DB]/80 dark:border-[#2E2B23]/80 space-y-2">
              <Link
                href="/submit"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Submit Product</span>
              </Link>

              {/* Theme selector inside mobile menu */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 text-xs">
                <span className="text-neutral-500 font-medium">Appearance</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "light"
                        ? "bg-white text-[#E4572E] shadow-2xs"
                        : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    }`}
                    title="Light Mode"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "dark"
                        ? "bg-[#1E1C16] text-[#E4572E] shadow-2xs"
                        : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    }`}
                    title="Dark Mode"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "system"
                        ? "bg-white dark:bg-[#1E1C16] text-[#E4572E] shadow-2xs"
                        : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    }`}
                    title="System Default"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!user && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
