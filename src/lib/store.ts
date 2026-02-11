import { LoyaltyCard, Transaction, SavedVehicle } from "@/types";

const LOYALTY_KEY = "marketio_loyalty_cards";
const TRANSACTIONS_KEY = "marketio_transactions";
const THEME_KEY = "marketio_theme";
const VEHICLES_KEY = "marketio_saved_vehicles";

export function getLoyaltyCards(): LoyaltyCard[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LOYALTY_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLoyaltyCard(card: LoyaltyCard): void {
  const cards = getLoyaltyCards();
  cards.push(card);
  localStorage.setItem(LOYALTY_KEY, JSON.stringify(cards));
}

export function deleteLoyaltyCard(id: string): void {
  const cards = getLoyaltyCards().filter((c) => c.id !== id);
  localStorage.setItem(LOYALTY_KEY, JSON.stringify(cards));
}

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addTransaction(tx: Omit<Transaction, "id" | "date" | "status">): Transaction {
  const transaction: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: "completed",
  };
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return transaction;
}

export function getSavedThemeId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(THEME_KEY);
}

export function saveThemeId(id: string): void {
  localStorage.setItem(THEME_KEY, id);
}

// --- Saved Vehicles ---

export function getSavedVehicles(): SavedVehicle[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(VEHICLES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveVehicle(plate: string, nickname: string, vehicleType: "car" | "motorcycle" = "car"): SavedVehicle {
  const vehicle: SavedVehicle = {
    id: crypto.randomUUID(),
    plate: plate.toUpperCase(),
    nickname,
    vehicleType,
    createdAt: new Date().toISOString(),
  };
  const vehicles = getSavedVehicles();
  vehicles.push(vehicle);
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  return vehicle;
}

export function deleteSavedVehicle(id: string): void {
  const vehicles = getSavedVehicles().filter((v) => v.id !== id);
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
}

export function hasVehicleWithPlate(plate: string): boolean {
  return getSavedVehicles().some((v) => v.plate === plate.toUpperCase());
}
