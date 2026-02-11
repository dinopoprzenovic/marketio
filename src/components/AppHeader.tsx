"use client";

import { useRouter } from "next/navigation";
import { MarketioLogo } from "./MarketioLogo";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
}

export function AppHeader({ title, showBack = false }: AppHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-primary px-4 shadow-sm">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {!showBack ? (
        <MarketioLogo variant="light" size="sm" />
      ) : (
        <h1 className="text-[17px] font-semibold text-white">{title}</h1>
      )}
    </div>
  );
}
