"use client";

import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { BottomSheet } from "@/components/animations";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { useServiceMutation } from "@/hooks/useServiceMutation";
import { addTransaction, getSavedVehicles, saveVehicle, hasVehicleWithPlate } from "@/lib/store";
import { sanitizePlate, isValidPlate } from "@/lib/validation";
import { Car, Plus, MapPin, Minus } from "lucide-react";
import type { ParkingCity, CityParkingZone, SavedVehicle } from "@/types";
import type { ParkingSessionRequest, ParkingSessionResult } from "@/services/parking";

/* ─── Duration config ─── */

const DURATION_TABS = ["Hour", "Day", "Week", "Month", "Year"] as const;
type DurationTab = (typeof DURATION_TABS)[number];

interface DurationOption {
  label: string;
  minutes: number;
}

const TAB_OPTIONS: Record<DurationTab, DurationOption[]> = {
  Hour: [
    { label: "30 minutes", minutes: 30 },
    { label: "1 hour", minutes: 60 },
    { label: "1.5 hours", minutes: 90 },
    { label: "2 hours", minutes: 120 },
    { label: "2.5 hours", minutes: 150 },
    { label: "3 hours", minutes: 180 },
  ],
  Day: [
    { label: "1 day", minutes: 480 },
    { label: "2 days", minutes: 960 },
    { label: "3 days", minutes: 1440 },
  ],
  Week: [
    { label: "1 week", minutes: 2400 },
    { label: "2 weeks", minutes: 4800 },
  ],
  Month: [{ label: "1 month", minutes: 10560 }],
  Year: [{ label: "1 year", minutes: 126720 }],
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Page ─── */

export default function ParkingPage() {
  /* Data */
  const { data: cities } = useServiceQuery<ParkingCity[]>("/api/parking/cities");
  const { mutate: startSession, loading: sessionLoading } =
    useServiceMutation<ParkingSessionRequest, ParkingSessionResult>("/api/parking/session");

  /* Vehicle */
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newNickname, setNewNickname] = useState("");

  /* City & zone */
  const [selectedCity, setSelectedCity] = useState<ParkingCity | null>(null);
  const [selectedZone, setSelectedZone] = useState<CityParkingZone | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  /* Duration */
  const [durationTab, setDurationTab] = useState<DurationTab>("Hour");
  const [durationIndex, setDurationIndex] = useState(0);

  /* Result */
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sessionResult, setSessionResult] = useState<ParkingSessionResult | null>(null);

  useEffect(() => {
    const saved = getSavedVehicles();
    setVehicles(saved);
    if (saved.length > 0) setSelectedVehicleId(saved[0].id);
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? null;
  const currentOptions = TAB_OPTIONS[durationTab];
  const currentDuration = currentOptions[durationIndex];
  const currentPrice =
    selectedZone && currentDuration
      ? Math.round(selectedZone.hourlyRate * (currentDuration.minutes / 60) * 100) / 100
      : 0;
  const canPay = !!(selectedVehicle && selectedCity && selectedZone);

  /* ─── Handlers ─── */

  function handleTabChange(tab: DurationTab) {
    setDurationTab(tab);
    setDurationIndex(0);
  }

  function handleAddVehicle() {
    if (!isValidPlate(newPlate) || hasVehicleWithPlate(newPlate)) return;
    const v = saveVehicle(newPlate, newNickname || newPlate, "car");
    setVehicles(getSavedVehicles());
    setSelectedVehicleId(v.id);
    setNewPlate("");
    setNewNickname("");
    setShowAddVehicle(false);
  }

  function handleCitySelect(city: ParkingCity) {
    setSelectedCity(city);
    setSelectedZone(null);
    setShowCityPicker(false);
  }

  async function handleConfirmPay() {
    if (!selectedCity || !selectedZone || !selectedVehicle) return;
    const result = await startSession({
      cityId: selectedCity.id,
      zoneId: selectedZone.id,
      licensePlate: selectedVehicle.plate,
      durationMinutes: currentDuration.minutes,
    });
    if (result) {
      addTransaction({
        type: "parking",
        category: "Parking",
        title: `Parking - ${selectedCity.name}, ${selectedZone.name}`,
        description: `${selectedVehicle.plate} - ${currentDuration.label}`,
        amount: result.amount,
        currency: "EUR",
      });
      setSessionResult(result);
      setShowConfirmation(false);
    }
  }

  /* ─── Success screen ─── */

  if (sessionResult) {
    return (
      <PhoneFrame>
        <AppHeader title="Parking" showBack={false} />
        <ConfirmationScreen
          title="Parking Ticket Active"
          statusBadge={{ label: "ACTIVE", color: "green" }}
          details={[
            { label: "Ticket No.", value: sessionResult.ticketNumber },
            { label: "City", value: sessionResult.city },
            { label: "Zone", value: sessionResult.zone },
            { label: "License Plate", value: sessionResult.licensePlate },
            { label: "Duration", value: sessionResult.durationLabel },
            { label: "Start", value: formatTime(sessionResult.startTime) },
            { label: "End", value: formatTime(sessionResult.endTime) },
          ]}
          amount={`\u20AC${sessionResult.amount.toFixed(2)}`}
        />
      </PhoneFrame>
    );
  }

  /* ─── Main render ─── */

  return (
    <PhoneFrame>
      <AppHeader title="Parking" showBack={true} />

      <div className="flex min-h-full flex-col">
        {/* ── Scrollable content ── */}
        <div className="flex-1 px-4 pt-5">
          <h1 className="mb-5 text-xl font-bold text-gray-900">Pay for your parking ticket</h1>

          {/* VEHICLE */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-bold text-gray-900">Vehicle</p>

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`min-w-[140px] flex-shrink-0 rounded-xl px-4 py-3 text-left transition-all ${
                    selectedVehicleId === v.id ? "bg-primary/10 ring-2 ring-primary" : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{v.nickname}</p>
                  <p className="text-xs text-gray-500">{v.plate}</p>
                </button>
              ))}

              {/* Add vehicle card */}
              <button
                onClick={() => setShowAddVehicle(true)}
                className="flex min-w-[140px] flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <Car className="h-5 w-5 text-gray-400" />
                  <Plus
                    className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-primary p-[1px] text-white"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-xs text-gray-500">Add vehicle</span>
              </button>
            </div>
          </div>

          {/* CITY AND ZONE */}
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">City and zone</p>
              <button className="text-sm font-semibold text-primary">Locate me</button>
            </div>

            <div className="rounded-xl bg-white shadow-sm">
              {/* City row */}
              <button
                onClick={() => setShowCityPicker(true)}
                className="flex w-full items-center justify-between px-4 py-3.5"
              >
                <span
                  className={`text-[15px] ${selectedCity ? "font-semibold text-gray-900" : "text-gray-400"}`}
                >
                  {selectedCity?.name ?? "Select a city"}
                </span>
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Zone chips */}
              {selectedCity && (
                <>
                  <div className="mx-4 border-t border-gray-100" />
                  <div className="flex flex-wrap gap-2 px-4 py-3">
                    {selectedCity.zones.map((zone) => {
                      const isSelected = selectedZone?.id === zone.id;
                      const shortName = zone.name.split("\u2014")[0].trim();
                      return (
                        <button
                          key={zone.id}
                          onClick={() => setSelectedZone(zone)}
                          className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                          style={{
                            backgroundColor: isSelected ? zone.color : `${zone.color}18`,
                            color: isSelected ? "#fff" : zone.color,
                          }}
                        >
                          {shortName}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom: duration + pay ── */}
        <div className="mt-auto border-t border-gray-200 bg-white px-4 pb-5 pt-3">
          {canPay ? (
            <>
              {/* Duration tabs */}
              <div className="mb-3 flex">
                {DURATION_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                      durationTab === tab ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Stepper */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => setDurationIndex(Math.max(0, durationIndex - 1))}
                  disabled={durationIndex === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 disabled:opacity-30"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{currentDuration.label}</p>
                  <p className="text-sm text-gray-500">{currentPrice.toFixed(2)} EUR</p>
                </div>
                <button
                  onClick={() =>
                    setDurationIndex(Math.min(currentOptions.length - 1, durationIndex + 1))
                  }
                  disabled={durationIndex >= currentOptions.length - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-primary disabled:opacity-30"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="mb-4 flex items-center justify-center py-3">
              <p className="text-sm text-gray-400">Select city and zone</p>
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={!canPay}
            className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-40"
          >
            Pay for your parking ticket
          </button>
        </div>
      </div>

      {/* ══════════ BOTTOM SHEETS ══════════ */}

      {/* Add Vehicle */}
      <BottomSheet isOpen={showAddVehicle} onClose={() => setShowAddVehicle(false)}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Add vehicle</h3>
          <button onClick={() => setShowAddVehicle(false)} className="text-gray-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          value={newPlate}
          onChange={(e) => setNewPlate(sanitizePlate(e.target.value))}
          placeholder="Vehicle registration"
          className="mb-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] uppercase text-gray-900 placeholder:normal-case placeholder:text-gray-400 outline-none focus:border-gray-400"
        />

        <div className="relative mb-6">
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value.slice(0, 20))}
            placeholder="Vehicle name (not mandatory)"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
          />
          <span className="absolute bottom-1 right-3 text-xs text-gray-400">
            {newNickname.length}/20
          </span>
        </div>

        <button
          onClick={handleAddVehicle}
          disabled={!isValidPlate(newPlate)}
          className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-30"
        >
          Add vehicle
        </button>
      </BottomSheet>

      {/* City Picker */}
      <BottomSheet isOpen={showCityPicker} onClose={() => setShowCityPicker(false)}>
        <h3 className="mb-4 text-lg font-bold text-gray-900">Select city</h3>
        <div className="max-h-[400px] overflow-y-auto">
          {cities &&
            (() => {
              const groups = new Map<string, ParkingCity[]>();
              for (const city of cities) {
                const group = groups.get(city.region) || [];
                group.push(city);
                groups.set(city.region, group);
              }
              return Array.from(groups.entries()).map(([region, regionCities]) => (
                <div key={region} className="mb-3">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {region}
                  </p>
                  {regionCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        selectedCity?.id === city.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{city.name}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {city.zones.length} zones
                      </span>
                    </button>
                  ))}
                </div>
              ));
            })()}
        </div>
      </BottomSheet>

      {/* Confirmation */}
      <BottomSheet isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <h3 className="mb-5 text-center text-lg font-bold text-gray-900">
          Confirm parking ticket payment
        </h3>

        <div className="mb-5 flex flex-col items-center gap-2">
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
            Vehicle: {selectedVehicle?.nickname}, {selectedVehicle?.plate}
          </span>
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
            Details: {selectedCity?.name},{" "}
            {selectedZone?.name.split("\u2014")[0].trim()}
          </span>
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
            Valid until:{" "}
            {new Date(Date.now() + currentDuration.minutes * 60 * 1000).toLocaleTimeString(
              "en-GB",
              { hour: "2-digit", minute: "2-digit" },
            )}
          </span>
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
            Total {currentPrice.toFixed(2)} EUR
          </span>
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
            Fee: 0.00 EUR
          </span>
        </div>

        <p className="mb-5 text-center text-xs text-gray-400">
          The location suggestion is only informative! Please check the surroundings for more
          details on which zone you are in
        </p>

        <button
          onClick={handleConfirmPay}
          disabled={sessionLoading}
          className="mb-3 w-full rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {sessionLoading ? "Processing..." : "Pay"}
        </button>
        <button
          onClick={() => setShowConfirmation(false)}
          className="w-full rounded-xl bg-primary/10 py-3.5 text-[15px] font-semibold text-primary transition-all active:scale-[0.98]"
        >
          Quit
        </button>
      </BottomSheet>
    </PhoneFrame>
  );
}
