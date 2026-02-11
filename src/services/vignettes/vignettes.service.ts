import type { ServiceResponse } from "../types";
import type { VignetteCountry, VignetteOrderStatus } from "@/types";

export interface VignettePurchaseRequest {
  countryId: string;
  vehicleTypeId: string;
  durationId: string;
  licensePlate: string;
  startDate: string; // ISO date string
}

export interface VignettePurchaseResult {
  orderId: string;
  vignetteId: string;
  country: string;
  vehicleType: string;
  duration: string;
  licensePlate: string;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  status: VignetteOrderStatus;
}

export interface VignetteOrderStatusResult {
  orderId: string;
  vignetteId: string;
  status: VignetteOrderStatus;
  startDate: string;
  endDate: string;
}

export interface VignettesService {
  getCountries(): Promise<ServiceResponse<VignetteCountry[]>>;
  purchase(req: VignettePurchaseRequest): Promise<ServiceResponse<VignettePurchaseResult>>;
  getOrderStatus(orderId: string): Promise<ServiceResponse<VignetteOrderStatusResult>>;
}
