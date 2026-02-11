import type { VignettesService, VignettePurchaseResult, VignetteOrderStatusResult } from "./vignettes.service";
import type { ServiceResponse } from "../types";
import type { VignetteCountry } from "@/types";
import { ok, err } from "../types";

const countries: VignetteCountry[] = [
  {
    id: "slovenia",
    name: "Slovenia",
    flag: "\u{1f1f8}\u{1f1ee}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "7d", label: "7 Days", price: 16 },
          { id: "1m", label: "1 Month", price: 32 },
          { id: "1y", label: "1 Year", price: 117 },
        ],
      },
      {
        id: "motorcycle",
        label: "Motorcycle",
        icon: "\u{1f3cd}\u{fe0f}",
        durations: [
          { id: "7d", label: "7 Days", price: 8 },
          { id: "1m", label: "1 Month", price: 16.5 },
          { id: "1y", label: "1 Year", price: 60 },
        ],
      },
    ],
  },
  {
    id: "austria",
    name: "Austria",
    flag: "\u{1f1e6}\u{1f1f9}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "10d", label: "10 Days", price: 11.5 },
          { id: "2m", label: "2 Months", price: 28.9 },
          { id: "1y", label: "1 Year", price: 96.4 },
        ],
      },
      {
        id: "motorcycle",
        label: "Motorcycle",
        icon: "\u{1f3cd}\u{fe0f}",
        durations: [
          { id: "10d", label: "10 Days", price: 5.8 },
          { id: "2m", label: "2 Months", price: 14.5 },
          { id: "1y", label: "1 Year", price: 38.2 },
        ],
      },
    ],
  },
  {
    id: "czech",
    name: "Czech Republic",
    flag: "\u{1f1e8}\u{1f1ff}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "10d", label: "10 Days", price: 15.2 },
          { id: "1m", label: "1 Month", price: 21.5 },
          { id: "1y", label: "1 Year", price: 57 },
        ],
      },
    ],
  },
  {
    id: "slovakia",
    name: "Slovakia",
    flag: "\u{1f1f8}\u{1f1f0}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "10d", label: "10 Days", price: 12 },
          { id: "1m", label: "1 Month", price: 17 },
          { id: "1y", label: "1 Year", price: 60 },
        ],
      },
    ],
  },
  {
    id: "switzerland",
    name: "Switzerland",
    flag: "\u{1f1e8}\u{1f1ed}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "1y", label: "1 Year", price: 41.5 },
        ],
      },
    ],
  },
  {
    id: "romania",
    name: "Romania",
    flag: "\u{1f1f7}\u{1f1f4}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "7d", label: "7 Days", price: 3.5 },
          { id: "1m", label: "30 Days", price: 8 },
          { id: "1y", label: "1 Year", price: 28 },
        ],
      },
    ],
  },
  {
    id: "hungary",
    name: "Hungary",
    flag: "\u{1f1ed}\u{1f1fa}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (D1 category)",
        icon: "\u{1f697}",
        durations: [
          { id: "10d", label: "10 Days", price: 14.9 },
          { id: "1m", label: "1 Month", price: 20.9 },
          { id: "1y", label: "1 Year", price: 155 },
        ],
      },
    ],
  },
  {
    id: "bulgaria",
    name: "Bulgaria",
    flag: "\u{1f1e7}\u{1f1ec}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "7d", label: "Weekend (7 Days)", price: 8 },
          { id: "1m", label: "1 Month", price: 15 },
          { id: "3m", label: "3 Months", price: 28 },
          { id: "1y", label: "1 Year", price: 48 },
        ],
      },
    ],
  },
  {
    id: "moldova",
    name: "Moldova",
    flag: "\u{1f1f2}\u{1f1e9}",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "\u{1f697}",
        durations: [
          { id: "7d", label: "7 Days", price: 4 },
          { id: "15d", label: "15 Days", price: 7 },
          { id: "1m", label: "1 Month", price: 14 },
          { id: "1y", label: "1 Year", price: 32 },
        ],
      },
    ],
  },
];

// In-memory order store for mock status tracking
const orderStore = new Map<string, VignettePurchaseResult>();

function computeEndDate(startDate: string, durationLabel: string): string {
  const date = new Date(startDate);
  const label = durationLabel.toLowerCase();

  if (label.includes("7 day") || label.includes("weekend")) date.setDate(date.getDate() + 7);
  else if (label.includes("10 day")) date.setDate(date.getDate() + 10);
  else if (label.includes("15 day")) date.setDate(date.getDate() + 15);
  else if (label.includes("30 day")) date.setDate(date.getDate() + 30);
  else if (label.includes("2 month")) date.setMonth(date.getMonth() + 2);
  else if (label.includes("3 month")) date.setMonth(date.getMonth() + 3);
  else if (label.includes("1 month")) date.setMonth(date.getMonth() + 1);
  else if (label.includes("1 year")) date.setFullYear(date.getFullYear() + 1);

  return date.toISOString();
}

function generateVignetteId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `VIG-2026-${suffix}`;
}

async function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockVignettesService: VignettesService = {
  async getCountries(): Promise<ServiceResponse<VignetteCountry[]>> {
    await delay();
    return ok(countries);
  },

  async purchase(req): Promise<ServiceResponse<VignettePurchaseResult>> {
    await delay(600);
    const country = countries.find((c) => c.id === req.countryId);
    const vehicle = country?.vehicleTypes.find((v) => v.id === req.vehicleTypeId);
    const duration = vehicle?.durations.find((d) => d.id === req.durationId);

    const startDate = req.startDate || new Date().toISOString();
    const endDate = computeEndDate(startDate, duration?.label ?? "7 Days");

    const result: VignettePurchaseResult = {
      orderId: crypto.randomUUID(),
      vignetteId: generateVignetteId(),
      country: country?.name ?? req.countryId,
      vehicleType: vehicle?.label ?? req.vehicleTypeId,
      duration: duration?.label ?? req.durationId,
      licensePlate: req.licensePlate.toUpperCase(),
      startDate,
      endDate,
      amount: duration?.price ?? 0,
      currency: country?.currency ?? "EUR",
      status: "ACTIVE",
    };

    orderStore.set(result.orderId, result);
    return ok(result);
  },

  async getOrderStatus(orderId): Promise<ServiceResponse<VignetteOrderStatusResult>> {
    await delay(200);
    const order = orderStore.get(orderId);
    if (!order) {
      return err("NOT_FOUND", "Order not found");
    }
    return ok({
      orderId: order.orderId,
      vignetteId: order.vignetteId,
      status: order.status,
      startDate: order.startDate,
      endDate: order.endDate,
    });
  },
};
