"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toggleFavorite } from "@/server/actions/favorites";
import { toast } from "sonner";

interface FavoriteButtonProps {
  projectId: string;
  initialHasFavorited?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({
  projectId,
  initialHasFavorited = false,
  size = "md",
  className = "",
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasFavorited, setHasFavorited] = useState(initialHasFavorited);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.info("Inicia sesión para guardar proyectos en favoritos");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const previousState = hasFavorited;
    setHasFavorited(!hasFavorited);

    startTransition(async () => {
      const res = await toggleFavorite(projectId);
      if (!res.success) {
        setHasFavorited(previousState);
        toast.error(res.error || "No se pudo actualizar favoritos");
      } else if (res.data) {
        setHasFavorited(res.data.favorited);
        toast.success(res.data.favorited ? "Guardado en tus favoritos" : "Eliminado de favoritos");
      }
    });
  };

  return (
    <button
      onClick={handleFavorite}
      disabled={isPending}
      className={`rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
        size === "sm" ? "w-8 h-8" : "w-10 h-10"
      } ${
        hasFavorited
          ? "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-500/20"
          : "bg-white dark:bg-[#1A1813] text-neutral-500 dark:text-neutral-400 border-[#E7E4DB] dark:border-[#2E2B23] hover:border-amber-400 hover:text-amber-500"
      } ${className}`}
      title={hasFavorited ? "Eliminar de guardados" : "Guardar en favoritos"}
      aria-label="Guardar proyecto"
    >
      <Bookmark
        className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} ${hasFavorited ? "fill-amber-500" : ""}`}
      />
    </button>
  );
}
