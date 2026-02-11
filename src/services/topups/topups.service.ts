import type { ServiceResponse } from "../types";
import type { TelcoOperator } from "@/types";

export interface TopupPurchaseRequest {
  operatorId: string;
  amount: number;
  phoneNumber: string;
}

export interface TopupPurchaseResult {
  transactionId: string;
  operator: string;
  amount: number;
  phoneNumber: string;
  status: "completed";
}

export interface TopupsService {
  getOperators(): Promise<ServiceResponse<TelcoOperator[]>>;
  purchase(req: TopupPurchaseRequest): Promise<ServiceResponse<TopupPurchaseResult>>;
}
