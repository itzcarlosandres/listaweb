import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#E8E5DC]/70 dark:bg-[#25221B]/80 ${className}`}
      {...props}
    />
  );
}
