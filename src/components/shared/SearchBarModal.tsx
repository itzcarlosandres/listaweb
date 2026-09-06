"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Command,
  X,
  Sparkles,
  TrendingUp,
  FolderGit2,
  Layers,
  User,
  ExternalLink,
  ArrowRight,
  Flame,
} from "lucide-react";

interface SearchResult {
  projects: {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    logoUrl: string | null;
    votesCount: number;
    category: { name: string; slug: string };
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    _count: { projects: number };
  }[];
  users: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  }[];
}

export function SearchBarModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ projects: [], categories: [], users: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ projects: [], categories: [], users: [] });
    }
  }, [open]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ projects: [], categories: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const hasResults =
    results.projects.length > 0 || results.categories.length > 0 || results.users.length > 0;

  return (
    <>
      {/* Trigger Button in Navbar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-full max-w-[220px] lg:max-w-[260px] px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-[#FAF9F6] dark:bg-[#17150F] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-xl hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-xs group"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary transition-colors" />
          <span className="truncate">Buscar productos...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-500 bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-md">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E7E4DB] dark:border-[#2E2B23] bg-[#FAF9F6]/50 dark:bg-[#17150F]/50">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar SaaS, apps, categorías o creadores..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd
                onClick={() => setOpen(false)}
                className="cursor-pointer text-[10px] font-mono px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-[#E7E4DB] dark:border-[#2E2B23]"
              >
                ESC
              </kbd>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto p-4 space-y-5 text-sm">
              {loading && (
                <div className="py-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Buscando en LaunchHub...
                </div>
              )}

              {!loading && !query && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 block mb-2">
                      Accesos Rápidos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSelect("/trending")}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
                      >
                        <Flame className="w-4 h-4 text-orange-500" />
                        <div>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block text-xs">
                            Trending
                          </span>
                          <span className="text-[10px] text-neutral-500">Más votados hoy</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSelect("/explore")}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
                      >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <div>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block text-xs">
                            Explorar
                          </span>
                          <span className="text-[10px] text-neutral-500">Filtros avanzados</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSelect("/categories")}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
                      >
                        <Layers className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block text-xs">
                            Categorías
                          </span>
                          <span className="text-[10px] text-neutral-500">16 colecciones</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!loading && query && !hasResults && (
                <div className="py-12 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                    No encontramos resultados para &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Prueba buscando por palabras clave, categoría o nombre de creador.
                  </p>
                </div>
              )}

              {/* Projects Results */}
              {results.projects.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 block mb-2">
                    Proyectos y SaaS ({results.projects.length})
                  </span>
                  <div className="space-y-1">
                    {results.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(`/project/${p.slug}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 relative overflow-hidden flex items-center justify-center font-bold text-xs text-neutral-600 dark:text-neutral-300">
                            {p.logoUrl ? (
                              <Image src={p.logoUrl} alt={p.name} fill className="object-cover" />
                            ) : (
                              p.name[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors truncate block">
                              {p.name}
                            </span>
                            <span className="text-xs text-neutral-500 truncate block">
                              {p.tagline}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-200/60 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                            {p.category.name}
                          </span>
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-0.5">
                            ▲ {p.votesCount}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Results */}
              {results.categories.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 block mb-2">
                    Categorías ({results.categories.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {results.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(`/category/${c.slug}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-neutral-200/60 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-primary font-mono">
                            {c.icon}
                          </span>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {c._count.projects} items
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {results.users.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 block mb-2">
                    Creadores ({results.users.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {results.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelect(`/user/${u.username}`)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative flex-shrink-0 flex items-center justify-center font-bold text-xs text-neutral-600">
                          {u.image ? (
                            <Image src={u.image} alt={u.username} fill className="object-cover" />
                          ) : (
                            u.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs block truncate">
                            {u.name || u.username}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono block">
                            @{u.username}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer helper */}
            <div className="px-4 py-2.5 bg-[#FAF9F6] dark:bg-[#17150F] border-t border-[#E7E4DB] dark:border-[#2E2B23] flex items-center justify-between text-[11px] text-neutral-500">
              <span>Navega con ⌘K o haz clic en cualquier resultado</span>
              <span className="font-mono">LaunchHub 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
