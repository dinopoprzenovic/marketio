import type { ServiceResponse } from "../types";
import type { RetailBrand } from "@/types";

export interface VoucherPurchaseRequest {
  brandId: string;
  amount: number;
}

export interface VoucherPurchaseResult {
  transactionId: string;
  brand: string;
  amount: number;
  currency: string;
  redemptionCode: string;
  status: "completed";
}

export interface VouchersService {
  getBrands(): Promise<ServiceResponse<RetailBrand[]>>;
  purchase(req: VoucherPurchaseRequest): Promise<ServiceResponse<VoucherPurchaseResult>>;
}
