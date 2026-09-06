"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleFollow } from "@/server/actions/follows";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  size = "md",
  className = "",
}: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  // No mostrar botón de follow a uno mismo
  if (session?.user?.id === targetUserId) {
    return null;
  }

  const handleFollow = () => {
    if (!session?.user) {
      toast.info("Inicia sesión para seguir a creadores");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    startTransition(async () => {
      const res = await toggleFollow(targetUserId);
      if (!res.success) {
        setIsFollowing(previousState);
        toast.error(res.error || "No se pudo actualizar el seguimiento");
      } else if (res.data) {
        setIsFollowing(res.data.following);
        toast.success(res.data.following ? "Ahora sigues a este creador" : "Has dejado de seguir a este creador");
      }
    });
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all cursor-pointer select-none ${
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs"
      } ${
        isFollowing
          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-[#E7E4DB] dark:border-[#2E2B23] hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30"
          : "bg-[#E4572E] text-white hover:bg-[#CE4A24] shadow-xs shadow-[#E4572E]/25"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5" />
          <span>Siguiendo</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
