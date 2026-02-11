import type { ParkingService, ParkingSessionResult } from "./parking.service";
import type { ServiceResponse } from "../types";
import type { ParkingCity, CityParkingZone } from "@/types";
import { ok, err } from "../types";

const cities: ParkingCity[] = [
  // Central Croatia
  {
    id: "zagreb",
    name: "Zagreb",
    region: "Central Croatia",
    zones: [
      { id: "zg-z1", name: "Zone 1 — Strict Centre", color: "#EF4444", hourlyRate: 1.60, operatingHours: "Mon-Sat 07:00-22:00" },
      { id: "zg-z2", name: "Zone 2 — Centre", color: "#F59E0B", hourlyRate: 1.10, operatingHours: "Mon-Sat 07:00-22:00" },
      { id: "zg-z3", name: "Zone 3 — Wider Centre", color: "#3B82F6", hourlyRate: 0.60, operatingHours: "Mon-Sat 07:00-22:00" },
      { id: "zg-z4", name: "Zone 4 — Suburbs", color: "#22C55E", hourlyRate: 0.30, operatingHours: "Mon-Fri 07:00-19:00" },
    ],
  },
  {
    id: "varazdin",
    name: "Varazdin",
    region: "Central Croatia",
    zones: [
      { id: "vz-z1", name: "Zone 1 — Old Town", color: "#EF4444", hourlyRate: 1.00, operatingHours: "Mon-Fri 07:00-19:00, Sat 07:00-14:00" },
      { id: "vz-z2", name: "Zone 2 — Centre", color: "#F59E0B", hourlyRate: 0.60, operatingHours: "Mon-Fri 07:00-19:00, Sat 07:00-14:00" },
      { id: "vz-z3", name: "Zone 3 — Wider Area", color: "#3B82F6", hourlyRate: 0.40, operatingHours: "Mon-Fri 07:00-16:00" },
    ],
  },
  // Dalmatia
  {
    id: "split",
    name: "Split",
    region: "Dalmatia",
    zones: [
      { id: "st-z0", name: "Zone 0 — Diocletian's Palace", color: "#991B1B", hourlyRate: 2.00, operatingHours: "Mon-Sun 00:00-24:00" },
      { id: "st-z1", name: "Zone 1 — City Centre", color: "#EF4444", hourlyRate: 1.60, operatingHours: "Mon-Sat 07:00-22:00" },
      { id: "st-z2", name: "Zone 2 — Bacvice & Firule", color: "#F59E0B", hourlyRate: 1.10, operatingHours: "Mon-Sat 07:00-22:00" },
      { id: "st-z3", name: "Zone 3 — Suburban", color: "#3B82F6", hourlyRate: 0.60, operatingHours: "Mon-Sat 07:00-20:00" },
    ],
  },
  {
    id: "dubrovnik",
    name: "Dubrovnik",
    region: "Dalmatia",
    zones: [
      { id: "du-z1", name: "Zone 1 — Old Town / Pile", color: "#EF4444", hourlyRate: 2.50, operatingHours: "Mon-Sun 00:00-24:00" },
      { id: "du-z2", name: "Zone 2 — Gruz & Lapad", color: "#F59E0B", hourlyRate: 1.30, operatingHours: "Mon-Sun 06:00-22:00" },
      { id: "du-z3", name: "Zone 3 — Wider Area", color: "#3B82F6", hourlyRate: 0.80, operatingHours: "Mon-Sat 07:00-20:00" },
    ],
  },
  {
    id: "zadar",
    name: "Zadar",
    region: "Dalmatia",
    zones: [
      { id: "zd-z1", name: "Zone 1 — Peninsula", color: "#EF4444", hourlyRate: 1.50, operatingHours: "Mon-Sun 07:00-22:00" },
      { id: "zd-z2", name: "Zone 2 — City Centre", color: "#F59E0B", hourlyRate: 0.90, operatingHours: "Mon-Sat 07:00-21:00" },
      { id: "zd-z3", name: "Zone 3 — Residential", color: "#3B82F6", hourlyRate: 0.50, operatingHours: "Mon-Fri 07:00-17:00" },
    ],
  },
  {
    id: "sibenik",
    name: "Sibenik",
    region: "Dalmatia",
    zones: [
      { id: "si-z1", name: "Zone 1 — Old Town", color: "#EF4444", hourlyRate: 1.30, operatingHours: "Mon-Sat 07:00-22:00" },
      { id: "si-z2", name: "Zone 2 — Centre", color: "#F59E0B", hourlyRate: 0.80, operatingHours: "Mon-Sat 07:00-20:00" },
    ],
  },
  // Kvarner
  {
    id: "rijeka",
    name: "Rijeka",
    region: "Kvarner",
    zones: [
      { id: "ri-z1", name: "Zone 1 — Korzo / Centre", color: "#EF4444", hourlyRate: 1.40, operatingHours: "Mon-Sat 07:00-21:00" },
      { id: "ri-z2", name: "Zone 2 — Inner City", color: "#F59E0B", hourlyRate: 0.90, operatingHours: "Mon-Sat 07:00-21:00" },
      { id: "ri-z3", name: "Zone 3 — Wider Area", color: "#3B82F6", hourlyRate: 0.50, operatingHours: "Mon-Fri 07:00-17:00" },
    ],
  },
  // Istria
  {
    id: "pula",
    name: "Pula",
    region: "Istria",
    zones: [
      { id: "pu-z1", name: "Zone 1 — Arena / Forum", color: "#EF4444", hourlyRate: 1.30, operatingHours: "Mon-Sat 07:00-22:00, Sun (summer) 07:00-22:00" },
      { id: "pu-z2", name: "Zone 2 — City Centre", color: "#F59E0B", hourlyRate: 0.80, operatingHours: "Mon-Sat 07:00-21:00" },
      { id: "pu-z3", name: "Zone 3 — Residential", color: "#3B82F6", hourlyRate: 0.50, operatingHours: "Mon-Fri 07:00-17:00" },
    ],
  },
  {
    id: "rovinj",
    name: "Rovinj",
    region: "Istria",
    zones: [
      { id: "ro-z1", name: "Zone 1 — Old Town", color: "#EF4444", hourlyRate: 1.80, operatingHours: "Mon-Sun 07:00-23:00 (summer), Mon-Sat 07:00-19:00 (winter)" },
      { id: "ro-z2", name: "Zone 2 — Centre", color: "#F59E0B", hourlyRate: 1.00, operatingHours: "Mon-Sat 07:00-21:00" },
    ],
  },
  // Slavonia
  {
    id: "osijek",
    name: "Osijek",
    region: "Slavonia",
    zones: [
      { id: "os-z1", name: "Zone 1 — Upper Town", color: "#EF4444", hourlyRate: 0.80, operatingHours: "Mon-Fri 07:00-19:00, Sat 07:00-14:00" },
      { id: "os-z2", name: "Zone 2 — Lower Town", color: "#F59E0B", hourlyRate: 0.50, operatingHours: "Mon-Fri 07:00-17:00" },
      { id: "os-z3", name: "Zone 3 — Residential", color: "#3B82F6", hourlyRate: 0.30, operatingHours: "Mon-Fri 07:00-15:00" },
    ],
  },
];

const parkingDurations = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
  { label: "All Day", minutes: 480 },
];

function generateTicketNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PKG-${code}`;
}

function formatDuration(minutes: number): string {
  return parkingDurations.find((d) => d.minutes === minutes)?.label ?? `${minutes} min`;
}

async function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockParkingService: ParkingService = {
  async getCities(): Promise<ServiceResponse<ParkingCity[]>> {
    await delay();
    return ok(cities);
  },

  async getZones(cityId): Promise<ServiceResponse<CityParkingZone[]>> {
    await delay(200);
    const city = cities.find((c) => c.id === cityId);
    if (!city) return err("NOT_FOUND", "City not found");
    return ok(city.zones);
  },

  async startSession(req): Promise<ServiceResponse<ParkingSessionResult>> {
    await delay(600);
    const city = cities.find((c) => c.id === req.cityId);
    const zone = city?.zones.find((z) => z.id === req.zoneId);
    if (!city || !zone) return err("NOT_FOUND", "City or zone not found");

    const amount = Math.round(zone.hourlyRate * (req.durationMinutes / 60) * 100) / 100;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + req.durationMinutes * 60 * 1000);

    return ok({
      sessionId: crypto.randomUUID(),
      ticketNumber: generateTicketNumber(),
      city: city.name,
      zone: zone.name,
      licensePlate: req.licensePlate.toUpperCase(),
      durationLabel: formatDuration(req.durationMinutes),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      amount,
      currency: "EUR",
      status: "active",
    });
  },
};
