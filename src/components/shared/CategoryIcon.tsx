import * as LucideIcons from "lucide-react";
import { Layers } from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = "w-4 h-4" }: CategoryIconProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[name] || Layers;
  return <IconComponent className={className} />;
}
