import { ParkingZone } from "@/types";

export const parkingZones: ParkingZone[] = [
  {
    id: "zone-1",
    name: "Zone 1 — City Center",
    description: "Main square, cathedral area, pedestrian zone",
    color: "#EF4444",
    hourlyRate: 1.6,
  },
  {
    id: "zone-2",
    name: "Zone 2 — Inner City",
    description: "Close to center, residential & commercial mix",
    color: "#F59E0B",
    hourlyRate: 1.1,
  },
  {
    id: "zone-3",
    name: "Zone 3 — Outer City",
    description: "Residential areas, shopping centers",
    color: "#3B82F6",
    hourlyRate: 0.6,
  },
  {
    id: "zone-4",
    name: "Zone 4 — Suburbs",
    description: "Park & ride, suburban neighborhoods",
    color: "#22C55E",
    hourlyRate: 0.3,
  },
];

export const parkingDurations = [
  { id: "30min", label: "30 min", minutes: 30 },
  { id: "1h", label: "1 hour", minutes: 60 },
  { id: "2h", label: "2 hours", minutes: 120 },
  { id: "3h", label: "3 hours", minutes: 180 },
  { id: "all-day", label: "All Day", minutes: 480 },
];
