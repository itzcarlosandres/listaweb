import {
  Rocket,
  Flame,
  Sparkles,
  Zap,
  Globe,
  Compass,
  Layers,
  Bot,
  Code,
  Terminal,
  Cpu,
  Star,
  Shield,
  Target,
  Gem,
} from "lucide-react";
import Image from "next/image";

interface BrandLogoProps {
  mode?: "image" | "text_icon" | "text";
  logoUrl?: string | null;
  iconName?: string;
  text?: string;
  textHighlight?: string;
  iconBg?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket,
  Flame,
  Sparkles,
  Zap,
  Globe,
  Compass,
  Layers,
  Bot,
  Code,
  Terminal,
  Cpu,
  Star,
  Shield,
  Target,
  Gem,
};

export function BrandLogo({
  mode = "text_icon",
  logoUrl,
  iconName = "Rocket",
  text = "Launch",
  textHighlight = "Hub",
  iconBg = "#E4572E",
  size = "md",
  className = "",
}: BrandLogoProps) {
  const IconComponent = ICON_MAP[iconName] || Rocket;

  const sizeClasses = {
    sm: {
      container: "gap-2",
      iconBox: "w-7 h-7 rounded-lg",
      icon: "w-3.5 h-3.5",
      text: "text-base",
      imgH: 24,
    },
    md: {
      container: "gap-2 sm:gap-2.5",
      iconBox: "w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shadow-xs",
      icon: "w-4 h-4 sm:w-4.5 sm:h-4.5",
      text: "text-lg sm:text-xl",
      imgH: 30,
    },
    lg: {
      container: "gap-3",
      iconBox: "w-11 h-11 rounded-2xl shadow-sm",
      icon: "w-6 h-6",
      text: "text-2xl",
      imgH: 40,
    },
  }[size];

  if (mode === "image" && logoUrl) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={text || "Brand Logo"}
          style={{ height: `${sizeClasses.imgH}px` }}
          className="w-auto object-contain"
        />
      </div>
    );
  }

  if (mode === "text") {
    return (
      <span
        className={`font-display font-extrabold tracking-tight text-[#17150F] dark:text-[#FAF9F6] ${sizeClasses.text} ${className}`}
      >
        {text}
        <span className="text-[#E4572E]">{textHighlight}</span>
      </span>
    );
  }

  // Default: text_icon
  return (
    <div className={`inline-flex items-center ${sizeClasses.container} group ${className}`}>
      <div
        className={`${sizeClasses.iconBox} flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105 shrink-0`}
        style={{ backgroundColor: iconBg }}
      >
        <IconComponent className={sizeClasses.icon} />
      </div>
      <span
        className={`font-display font-extrabold tracking-tight text-[#17150F] dark:text-[#FAF9F6] ${sizeClasses.text}`}
      >
        {text}
        <span style={{ color: iconBg }}>{textHighlight}</span>
      </span>
    </div>
  );
}
