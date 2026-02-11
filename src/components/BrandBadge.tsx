"use client";

interface BrandBadgeProps {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-14 w-14 text-lg",
};

export function BrandBadge({ initials, color, size = "md" }: BrandBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl font-bold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
