import { LoyaltyCard, Transaction } from "@/types";

const LOYALTY_KEY = "marketio_loyalty_cards";
const TRANSACTIONS_KEY = "marketio_transactions";
const THEME_KEY = "marketio_theme";

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
