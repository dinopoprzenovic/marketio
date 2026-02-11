import type { LotteryService, LotteryPurchaseResult } from "./lottery.service";
import type { ServiceResponse } from "../types";
import type { LotteryProduct } from "@/types";
import { ok } from "../types";

const products: LotteryProduct[] = [
  {
    id: "loto-6-45",
    name: "Loto 6/45",
    icon: "CircleDot",
    description: "Pick 6 numbers from 1-45. Draws every Wednesday and Saturday.",
    price: 1.5,
    type: "lottery",
  },
  {
    id: "eurojackpot",
    name: "EuroJackpot",
    icon: "Star",
    description: "European lottery with jackpots up to \u20AC120 million. Draws Tue & Fri.",
    price: 2,
    type: "lottery",
  },
  {
    id: "bingo",
    name: "TV Bingo",
    icon: "Tv",
    description: "Classic bingo game, live draw on TV. Every Monday at 19:15.",
    price: 1,
    type: "lottery",
  },
  {
    id: "scratch-luck",
    name: "Scratch Card - Lucky 7",
    icon: "Clover",
    description: "Instant scratch card. Match 3 symbols to win up to \u20AC10,000.",
    price: 2,
    type: "lottery",
  },
  {
    id: "scratch-gold",
    name: "Scratch Card - Gold Rush",
    icon: "Coins",
    description: "Premium scratch card. Win up to \u20AC50,000 instantly.",
    price: 5,
    type: "lottery",
  },
  {
    id: "paysafe-10",
    name: "Paysafecard \u20AC10",
    icon: "CreditCard",
    description: "Prepaid online payment voucher. Use anywhere Paysafecard is accepted.",
    price: 10,
    type: "paysafe",
  },
  {
    id: "paysafe-25",
    name: "Paysafecard \u20AC25",
    icon: "CreditCard",
    description: "Prepaid online payment voucher. Use anywhere Paysafecard is accepted.",
    price: 25,
    type: "paysafe",
  },
  {
    id: "paysafe-50",
    name: "Paysafecard \u20AC50",
    icon: "CreditCard",
    description: "Prepaid online payment voucher. Use anywhere Paysafecard is accepted.",
    price: 50,
    type: "paysafe",
  },
  {
    id: "paysafe-100",
    name: "Paysafecard \u20AC100",
    icon: "CreditCard",
    description: "Prepaid online payment voucher. Use anywhere Paysafecard is accepted.",
    price: 100,
    type: "paysafe",
  },
];

function generateTicketNumber(): string {
  const digits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join("");
  return `HR-LOT-${digits}`;
}

function generatePaysafePin(): string {
  const groups = Array.from({ length: 4 }, () =>
    String(Math.floor(Math.random() * 10000)).padStart(4, "0")
  );
  return groups.join(" ");
}

function generateSerial(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `SER-${rand}`;
}

function getNextDrawDate(productId: string): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  let targetDays: number[];
  if (productId === "eurojackpot") targetDays = [2, 5];
  else if (productId === "bingo") targetDays = [1];
  else targetDays = [3, 6];

  for (let offset = 1; offset <= 7; offset++) {
    const candidate = (dayOfWeek + offset) % 7;
    if (targetDays.includes(candidate)) {
      const date = new Date(now);
      date.setDate(date.getDate() + offset);
      return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    }
  }
  return "TBD";
}

async function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockLotteryService: LotteryService = {
  async getProducts(): Promise<ServiceResponse<LotteryProduct[]>> {
    await delay();
    return ok(products);
  },

  async purchase(req): Promise<ServiceResponse<LotteryPurchaseResult>> {
    await delay(600);
    const product = products.find((p) => p.id === req.productId);
    if (!product) {
      return ok({
        transactionId: crypto.randomUUID(),
        product: req.productId,
        type: "lottery",
        amount: 0,
        currency: "EUR",
        status: "completed",
      });
    }

    if (product.type === "paysafe") {
      return ok({
        transactionId: crypto.randomUUID(),
        product: product.name,
        type: "paysafe",
        pin: generatePaysafePin(),
        serial: generateSerial(),
        amount: product.price,
        currency: "EUR",
        status: "completed",
      });
    }

    const isScratch = product.id.startsWith("scratch");
    return ok({
      transactionId: crypto.randomUUID(),
      product: product.name,
      type: "lottery",
      ticketNumber: generateTicketNumber(),
      ...(isScratch
        ? {}
        : {
            drawDate: getNextDrawDate(product.id),
            quickPick: req.quickPick,
          }),
      amount: product.price,
      currency: "EUR",
      status: "completed",
    });
  },
};
