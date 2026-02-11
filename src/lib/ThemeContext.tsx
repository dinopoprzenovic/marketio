"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BankTheme } from "@/types";
import { bankThemes, defaultTheme } from "@/lib/theme";
import { getSavedThemeId, saveThemeId } from "@/lib/store";

interface ThemeContextType {
  theme: BankTheme;
  setTheme: (theme: BankTheme) => void;
  allThemes: BankTheme[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  allThemes: bankThemes,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BankTheme>(defaultTheme);

  useEffect(() => {
    const savedId = getSavedThemeId();
    if (savedId) {
      const found = bankThemes.find((t) => t.id === savedId);
      if (found) setThemeState(found);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--bank-primary", theme.primary);
    document.documentElement.style.setProperty("--bank-primary-light", theme.primaryLight);
    document.documentElement.style.setProperty("--bank-accent", theme.accent);
  }, [theme]);

  const setTheme = (newTheme: BankTheme) => {
    setThemeState(newTheme);
    saveThemeId(newTheme.id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, allThemes: bankThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
