"use client";

import { useTheme } from "@/lib/ThemeContext";

export function ThemeSwitcher() {
  const { theme, setTheme, allThemes } = useTheme();

  return (
    <div className="w-[220px] rounded-2xl bg-white p-5 shadow-lg">
      <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">Bank Theme</p>
      <p className="mb-4 text-[11px] text-gray-400">Switch to preview white-label</p>
      <div className="flex flex-col gap-2">
        {allThemes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
              theme.id === t.id
                ? "bg-gray-100 font-medium ring-2 ring-gray-300"
                : "hover:bg-gray-50"
            }`}
          >
            <div
              className="h-5 w-5 shrink-0 rounded-full shadow-inner"
              style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
            />
            <span className="text-gray-700">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
