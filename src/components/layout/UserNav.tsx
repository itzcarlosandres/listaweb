"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { UserAvatar } from "../shared/UserAvatar";
import {
  User as UserIcon,
  LayoutDashboard,
  FolderGit2,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import type { SessionUser } from "@/types";

interface UserNavProps {
  user: SessionUser;
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <UserAvatar src={user.image} name={user.name || user.username} size="sm" />
        <span className="hidden md:inline-block text-xs font-semibold text-[#17150F] dark:text-[#FAF9F6]">
          {user.username}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-[#E7E4DB] dark:border-[#2E2B23] mb-1">
            <p className="text-xs font-bold text-[#17150F] dark:text-[#FAF9F6] truncate">
              {user.name || user.username}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#E4572E]/10 text-[#E4572E]">
                {user.plan}
              </span>
              {user.role === "ADMIN" && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <Link
              href={`/user/${user.username}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-neutral-400" />
              Mi Perfil Público
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-neutral-400" />
              Panel de Control
            </Link>

            <Link
              href="/dashboard/projects"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-neutral-400" />
              Mis Proyectos
            </Link>

            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bell className="w-4 h-4 text-neutral-400" />
              Notificaciones
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Panel Admin
              </Link>
            )}
          </div>

          <div className="pt-1 mt-1 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
