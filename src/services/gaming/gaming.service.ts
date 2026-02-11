import type { ServiceResponse } from "../types";
import type { GamingPlatform } from "@/types";

export interface GamingPurchaseRequest {
  platformId: string;
  voucherId: string;
}

export interface GamingPurchaseResult {
  transactionId: string;
  platform: string;
  voucherLabel: string;
  code: string;
  amount: number;
  currency: string;
  status: "completed";
}

export interface GamingService {
  getPlatforms(): Promise<ServiceResponse<GamingPlatform[]>>;
  purchase(req: GamingPurchaseRequest): Promise<ServiceResponse<GamingPurchaseResult>>;
}
