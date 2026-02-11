import type { ServiceResponse } from "../types";
import type { ParkingCity, CityParkingZone } from "@/types";

export interface ParkingSessionRequest {
  cityId: string;
  zoneId: string;
  licensePlate: string;
  durationMinutes: number;
}

export interface ParkingSessionResult {
  sessionId: string;
  ticketNumber: string;
  city: string;
  zone: string;
  licensePlate: string;
  durationLabel: string;
  startTime: string;
  endTime: string;
  amount: number;
  currency: string;
  status: "active";
}

export interface ParkingService {
  getCities(): Promise<ServiceResponse<ParkingCity[]>>;
  getZones(cityId: string): Promise<ServiceResponse<CityParkingZone[]>>;
  startSession(req: ParkingSessionRequest): Promise<ServiceResponse<ParkingSessionResult>>;
}
