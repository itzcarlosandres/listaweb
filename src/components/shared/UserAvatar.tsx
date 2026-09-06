import Image from "next/image";
import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-16 h-16 text-base",
};

export function UserAvatar({ src, name, size = "md", className = "" }: UserAvatarProps) {
  const initials = getInitials(name);

  if (src && !src.startsWith("data:image/svg")) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden shrink-0 border border-[#E7E4DB] dark:border-[#2E2B23] ${className}`}>
        <Image
          src={src}
          alt={name || "Usuario"}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
    );
  }

  if (src && src.startsWith("data:image/svg")) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden shrink-0 border border-[#E7E4DB] dark:border-[#2E2B23] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name || "Usuario"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#E4572E] text-white font-bold flex items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
}
