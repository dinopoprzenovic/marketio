"use client";

import { ShoppingBag } from "lucide-react";

interface MarketioLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

export function MarketioLogo({ variant = "light", size = "md" }: MarketioLogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-primary";
  const iconColor = variant === "light" ? "text-white/90" : "text-primary";
  const textSize = size === "sm" ? "text-base" : "text-xl";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-2">
      <ShoppingBag className={`${iconSize} ${iconColor}`} strokeWidth={2.5} />
      <span className={`${textSize} font-bold tracking-tight ${textColor}`}>
        Marketio
      </span>
    </div>
  );
}
