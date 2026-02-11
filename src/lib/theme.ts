import { BankTheme } from "@/types";

export const bankThemes: BankTheme[] = [
  {
    id: "marketio",
    name: "Marketio",
    primary: "#1E3A5F",
    primaryLight: "#2B5289",
    accent: "#3B82F6",
  },
  {
    id: "croatia-banka",
    name: "Croatia Banka",
    primary: "#6b1726",
    primaryLight: "#8B2336",
    accent: "#c41230",
  },
  {
    id: "erste",
    name: "Erste Bank",
    primary: "#0D2B6B",
    primaryLight: "#14408F",
    accent: "#1A54B8",
  },
  {
    id: "pbz",
    name: "PBZ",
    primary: "#003D79",
    primaryLight: "#004E9B",
    accent: "#0066CC",
  },
  {
    id: "rba",
    name: "Raiffeisen",
    primary: "#1D1D1B",
    primaryLight: "#333333",
    accent: "#FFE600",
  },
];

export const defaultTheme = bankThemes[0];
