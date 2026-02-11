export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface TelcoOperator {
  id: string;
  name: string;
  logo: string;
  color: string;
  amounts: number[];
}

export interface GamingPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  vouchers: VoucherDenomination[];
}

export interface VoucherDenomination {
  id: string;
  label: string;
  price: number;
  currency: string;
}

export interface RetailBrand {
  id: string;
  name: string;
  icon: string;
  color: string;
  amounts: number[];
}

export interface VignetteCountry {
  id: string;
  name: string;
  flag: string;
  currency: string;
  vehicleTypes: VehicleType[];
}

export interface VehicleType {
  id: string;
  label: string;
  icon: string;
  durations: VignetteDuration[];
}

export interface VignetteDuration {
  id: string;
  label: string;
  price: number;
}

export interface LotteryProduct {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  type: "lottery" | "paysafe";
}

export interface LoyaltyCard {
  id: string;
  storeName: string;
  cardNumber: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface ParkingZone {
  id: string;
  name: string;
  description: string;
  color: string;
  hourlyRate: number;
}

export interface ParkingDuration {
  id: string;
  label: string;
  minutes: number;
}

export interface BankTheme {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  accent: string;
  logo?: string;
}
