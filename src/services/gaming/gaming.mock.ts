import type { GamingService, GamingPurchaseResult } from "./gaming.service";
import type { ServiceResponse } from "../types";
import type { GamingPlatform } from "@/types";
import { ok } from "../types";

const platforms: GamingPlatform[] = [
  {
    id: "playstation",
    name: "PlayStation",
    icon: "PS",
    color: "#003087",
    vouchers: [
      { id: "psn-10", label: "PSN \u20AC10", price: 10, currency: "EUR" },
      { id: "psn-20", label: "PSN \u20AC20", price: 20, currency: "EUR" },
      { id: "psn-50", label: "PSN \u20AC50", price: 50, currency: "EUR" },
      { id: "psn-100", label: "PSN \u20AC100", price: 100, currency: "EUR" },
      { id: "ps-plus-1m", label: "PS Plus 1 Month", price: 8.99, currency: "EUR" },
      { id: "ps-plus-3m", label: "PS Plus 3 Months", price: 24.99, currency: "EUR" },
      { id: "ps-plus-12m", label: "PS Plus 12 Months", price: 59.99, currency: "EUR" },
    ],
  },
  {
    id: "xbox",
    name: "Xbox",
    icon: "XB",
    color: "#107C10",
    vouchers: [
      { id: "xbox-10", label: "Xbox \u20AC10", price: 10, currency: "EUR" },
      { id: "xbox-20", label: "Xbox \u20AC20", price: 20, currency: "EUR" },
      { id: "xbox-50", label: "Xbox \u20AC50", price: 50, currency: "EUR" },
      { id: "xbox-100", label: "Xbox \u20AC100", price: 100, currency: "EUR" },
      { id: "gamepass-1m", label: "Game Pass 1 Month", price: 14.99, currency: "EUR" },
      { id: "gamepass-3m", label: "Game Pass 3 Months", price: 39.99, currency: "EUR" },
    ],
  },
  {
    id: "steam",
    name: "Steam",
    icon: "ST",
    color: "#1B2838",
    vouchers: [
      { id: "steam-10", label: "Steam \u20AC10", price: 10, currency: "EUR" },
      { id: "steam-20", label: "Steam \u20AC20", price: 20, currency: "EUR" },
      { id: "steam-50", label: "Steam \u20AC50", price: 50, currency: "EUR" },
      { id: "steam-100", label: "Steam \u20AC100", price: 100, currency: "EUR" },
    ],
  },
  {
    id: "nintendo",
    name: "Nintendo",
    icon: "NI",
    color: "#E4000F",
    vouchers: [
      { id: "nin-15", label: "Nintendo \u20AC15", price: 15, currency: "EUR" },
      { id: "nin-25", label: "Nintendo \u20AC25", price: 25, currency: "EUR" },
      { id: "nin-50", label: "Nintendo \u20AC50", price: 50, currency: "EUR" },
      { id: "nso-1m", label: "NSO 1 Month", price: 3.99, currency: "EUR" },
      { id: "nso-12m", label: "NSO 12 Months", price: 19.99, currency: "EUR" },
    ],
  },
];

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const group = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${group()}-${group()}-${group()}-${group()}`;
}

async function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockGamingService: GamingService = {
  async getPlatforms(): Promise<ServiceResponse<GamingPlatform[]>> {
    await delay();
    return ok(platforms);
  },

  async purchase(req): Promise<ServiceResponse<GamingPurchaseResult>> {
    await delay(600);
    const platform = platforms.find((p) => p.id === req.platformId);
    const voucher = platform?.vouchers.find((v) => v.id === req.voucherId);
    return ok({
      transactionId: crypto.randomUUID(),
      platform: platform?.name ?? req.platformId,
      voucherLabel: voucher?.label ?? req.voucherId,
      code: generateCode(),
      amount: voucher?.price ?? 0,
      currency: voucher?.currency ?? "EUR",
      status: "completed",
    });
  },
};
