import type { ServiceResponse } from "../types";
import type { LotteryProduct } from "@/types";

export interface LotteryPurchaseRequest {
  productId: string;
  quickPick?: number[];
}

export interface LotteryPurchaseResult {
  transactionId: string;
  product: string;
  type: "lottery" | "paysafe";
  ticketNumber?: string;
  drawDate?: string;
  quickPick?: number[];
  pin?: string;
  serial?: string;
  amount: number;
  currency: string;
  status: "completed";
}

export interface LotteryService {
  getProducts(): Promise<ServiceResponse<LotteryProduct[]>>;
  purchase(req: LotteryPurchaseRequest): Promise<ServiceResponse<LotteryPurchaseResult>>;
}
