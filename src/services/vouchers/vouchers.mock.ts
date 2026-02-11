import type { VouchersService, VoucherPurchaseResult } from "./vouchers.service";
import type { ServiceResponse } from "../types";
import type { RetailBrand } from "@/types";
import { ok } from "../types";

const brands: RetailBrand[] = [
  { id: "ikea", name: "IKEA", icon: "IK", color: "#0058A3", amounts: [10, 25, 50, 100] },
  { id: "hm", name: "H&M", icon: "HM", color: "#E50010", amounts: [10, 25, 50] },
  { id: "zara", name: "Zara", icon: "ZA", color: "#000000", amounts: [25, 50, 100] },
  { id: "spotify", name: "Spotify", icon: "SP", color: "#1DB954", amounts: [10, 30, 60] },
  { id: "netflix", name: "Netflix", icon: "NF", color: "#E50914", amounts: [15, 25, 50] },
  { id: "amazon", name: "Amazon", icon: "AZ", color: "#FF9900", amounts: [10, 25, 50, 100] },
  { id: "google-play", name: "Google Play", icon: "GP", color: "#01875F", amounts: [10, 15, 25, 50] },
  { id: "apple", name: "Apple / App Store", icon: "AP", color: "#555555", amounts: [10, 15, 25, 50, 100] },
];

function generateRedemptionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const group = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `GIFT-${group()}-${group()}`;
}

async function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockVouchersService: VouchersService = {
  async getBrands(): Promise<ServiceResponse<RetailBrand[]>> {
    await delay();
    return ok(brands);
  },

  async purchase(req): Promise<ServiceResponse<VoucherPurchaseResult>> {
    await delay(600);
    const brand = brands.find((b) => b.id === req.brandId);
    return ok({
      transactionId: crypto.randomUUID(),
      brand: brand?.name ?? req.brandId,
      amount: req.amount,
      currency: "EUR",
      redemptionCode: generateRedemptionCode(),
      status: "completed",
    });
  },
};
