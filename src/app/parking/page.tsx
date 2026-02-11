"use client";

import { useState, useCallback, useMemo } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepIndicator } from "@/components/StepIndicator";
import { VehiclePicker } from "@/components/VehiclePicker";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StepTransition, StaggerGrid, StaggerItem } from "@/components/animations";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { useServiceMutation } from "@/hooks/useServiceMutation";
import { addTransaction, hasVehicleWithPlate, saveVehicle } from "@/lib/store";
import { Clock, Search, MapPin } from "lucide-react";
import type { ParkingCity, CityParkingZone } from "@/types";
import type { ParkingSessionRequest, ParkingSessionResult } from "@/services/parking";

type Step = "vehicle" | "city" | "zone" | "duration" | "done";

const PARKING_STEPS = ["Vehicle", "City", "Zone", "Pay"];

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
  { label: "All Day", minutes: 480 },
];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ParkingPage() {
  const { data: cities, loading: citiesLoading, error: citiesError, refetch: refetchCities } =
    useServiceQuery<ParkingCity[]>("/api/parking/cities");

  const { mutate: startSession, loading: sessionLoading } =
    useServiceMutation<ParkingSessionRequest, ParkingSessionResult>("/api/parking/session");

  const [step, setStep] = useState<Step>("vehicle");
  const [selectedCity, setSelectedCity] = useState<ParkingCity | null>(null);
  const [selectedZone, setSelectedZone] = useState<CityParkingZone | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [plateValid, setPlateValid] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<typeof DURATIONS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionResult, setSessionResult] = useState<ParkingSessionResult | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveNickname, setSaveNickname] = useState("");

  const onPlateChange = useCallback((plate: string) => setLicensePlate(plate), []);
  const onValidChange = useCallback((valid: boolean) => setPlateValid(valid), []);

  // Group cities by region and filter by search
  const groupedCities = useMemo(() => {
    if (!cities) return new Map<string, ParkingCity[]>();
    const filtered = searchQuery
      ? cities.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : cities;

    const groups = new Map<string, ParkingCity[]>();
    for (const city of filtered) {
      const group = groups.get(city.region) || [];
      group.push(city);
      groups.set(city.region, group);
    }
    return groups;
  }, [cities, searchQuery]);

  function getStepIndex(): number {
    switch (step) {
      case "vehicle": return 0;
      case "city": return 1;
      case "zone": return 2;
      case "duration": return 3;
      case "done": return 3;
    }
  }

  function handleVehicleContinue() {
    if (!plateValid) return;
    setStep("city");
  }

  function handleCitySelect(city: ParkingCity) {
    setSelectedCity(city);
    setSelectedZone(null);
    setStep("zone");
  }

  function handleZoneSelect(zone: CityParkingZone) {
    setSelectedZone(zone);
    setSelectedDuration(null);
    setStep("duration");
  }

  function calculatePrice(zone: CityParkingZone, duration: typeof DURATIONS[0]): number {
    return Math.round(zone.hourlyRate * (duration.minutes / 60) * 100) / 100;
  }

  async function handlePurchase() {
    if (!selectedCity || !selectedZone || !selectedDuration) return;

    const result = await startSession({
      cityId: selectedCity.id,
      zoneId: selectedZone.id,
      licensePlate,
      durationMinutes: selectedDuration.minutes,
    });

    if (result) {
      addTransaction({
        type: "parking",
        category: "Parking",
        title: `Parking - ${selectedCity.name}, ${selectedZone.name}`,
        description: `${licensePlate.toUpperCase()} - ${selectedDuration.label}`,
        amount: result.amount,
        currency: "EUR",
      });
      setSessionResult(result);
      if (!hasVehicleWithPlate(licensePlate)) {
        setShowSavePrompt(true);
      }
      setStep("done");
    }
  }

  function handleBack() {
    if (step === "city") {
      setStep("vehicle");
    } else if (step === "zone") {
      setStep("city");
      setSelectedCity(null);
    } else if (step === "duration") {
      setStep("zone");
      setSelectedZone(null);
      setSelectedDuration(null);
    }
  }

  function handleSaveVehicle() {
    if (!hasVehicleWithPlate(licensePlate)) {
      saveVehicle(licensePlate, saveNickname || licensePlate, "car");
    }
    setShowSavePrompt(false);
    setSaveNickname("");
  }

  // Header title changes as you progress
  const headerTitle = selectedCity ? `Parking - ${selectedCity.name}` : "Parking";

  if (step === "done" && sessionResult) {
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
        {/* Save vehicle prompt */}
        {showSavePrompt && (
          <div className="mx-4 -mt-4 mb-6 rounded-xl bg-blue-50 p-3">
            <p className="mb-2 text-sm font-medium text-blue-800">Save this vehicle for next time?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={saveNickname}
                onChange={(e) => setSaveNickname(e.target.value)}
                placeholder="Nickname (optional)"
                className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400"
              />
              <button
                onClick={handleSaveVehicle}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
            <button onClick={() => setShowSavePrompt(false)} className="mt-1.5 text-xs text-blue-600">
              Skip
            </button>
          </div>
        )}
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title={headerTitle} showBack={true} />

      <div className="px-4 py-5">
        {citiesLoading && step !== "vehicle" && <LoadingState rows={5} />}
        {citiesError && step !== "vehicle" && <ErrorState message={citiesError} onRetry={refetchCities} />}

        <StepIndicator steps={PARKING_STEPS} currentStep={getStepIndex()} />

        {step !== "vehicle" && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-1 text-sm font-medium text-primary transition-colors active:opacity-70"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Step 1: Vehicle — enter plate or pick saved vehicle */}
        {step === "vehicle" && (
          <StepTransition stepKey="vehicle">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Your Vehicle</h2>
            <p className="mb-4 text-sm text-gray-500">Select a saved vehicle or enter a new plate</p>

            <VehiclePicker
              selectedPlate={licensePlate}
              onPlateChange={onPlateChange}
              onValidChange={onValidChange}
            />
            <div className="mb-5" />

            <PurchaseButton
              label="Continue"
              disabled={!plateValid}
              onClick={handleVehicleContinue}
            />
          </StepTransition>
        )}

        {/* Step 2: City selection */}
        {step === "city" && (
          <StepTransition stepKey="city">
            {/* GPS suggestion banner */}
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Based on your location:</span>{" "}
                Zagreb
              </p>
            </div>

            <h2 className="mb-1 text-lg font-bold text-gray-900">Select City</h2>
            <p className="mb-4 text-sm text-gray-500">
              Parking for <span className="font-semibold text-gray-700">{licensePlate.toUpperCase()}</span>
            </p>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {citiesLoading && <LoadingState rows={5} />}
            {citiesError && <ErrorState message={citiesError} onRetry={refetchCities} />}

            {/* Cities grouped by region */}
            {cities && Array.from(groupedCities.entries()).map(([region, regionCities]) => (
              <div key={region} className="mb-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {region}
                </p>
                <StaggerGrid className="flex flex-col gap-2">
                  {regionCities.map((city) => (
                    <StaggerItem key={city.id}>
                      <button
                        onClick={() => handleCitySelect(city)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
                          <MapPin className="h-5 w-5 text-cyan-600" strokeWidth={2} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-gray-800">{city.name}</p>
                          <p className="text-xs text-gray-500">{city.zones.length} zones</p>
                        </div>
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </div>
            ))}

            {cities && groupedCities.size === 0 && searchQuery && (
              <p className="py-8 text-center text-sm text-gray-400">
                No cities found for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </StepTransition>
        )}

        {/* Step 3: Zone selection */}
        {step === "zone" && selectedCity && (
          <StepTransition stepKey="zone">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Select Zone</h2>
            <p className="mb-4 text-sm text-gray-500">
              {selectedCity.name} &middot; {licensePlate.toUpperCase()}
            </p>

            <StaggerGrid className="flex flex-col gap-3">
              {selectedCity.zones.map((zone) => (
                <StaggerItem key={zone.id}>
                  <button
                    onClick={() => handleZoneSelect(zone)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97]"
                    style={{ borderLeft: `4px solid ${zone.color}` }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${zone.color}15` }}
                    >
                      <span className="text-xs font-bold" style={{ color: zone.color }}>
                        {zone.name.match(/Zone\s*(\d+|0)/i)?.[0] ?? "Z"}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-800">{zone.name}</p>
                      <p className="text-xs text-gray-500">{zone.operatingHours}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      &euro;{zone.hourlyRate.toFixed(2)}/h
                    </span>
                  </button>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </StepTransition>
        )}

        {/* Step 4: Duration + Pay (combined) */}
        {step === "duration" && selectedCity && selectedZone && (
          <StepTransition stepKey="duration">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Duration &amp; Pay</h2>
            <p className="mb-4 text-sm text-gray-500">
              {selectedCity.name} &middot; {selectedZone.name}
            </p>

            {/* Compact session info */}
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
                <MapPin className="h-5 w-5 text-cyan-600" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{licensePlate.toUpperCase()}</p>
                <p className="text-xs text-gray-500">{selectedCity.name}, {selectedZone.name}</p>
              </div>
              <span className="text-sm font-bold text-primary">
                &euro;{selectedZone.hourlyRate.toFixed(2)}/h
              </span>
            </div>

            <div className="mb-5 flex flex-col gap-2">
              {DURATIONS.map((dur) => {
                const price = calculatePrice(selectedZone, dur);
                const isSelected = selectedDuration?.minutes === dur.minutes;
                return (
                  <button
                    key={dur.minutes}
                    onClick={() => setSelectedDuration(dur)}
                    className={`flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm transition-all active:scale-[0.98] ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-[15px] font-medium text-gray-800">{dur.label}</span>
                    </div>
                    <span className="text-[15px] font-bold text-primary">
                      &euro;{price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            <PurchaseButton
              label="Pay for Parking"
              price={selectedDuration ? `\u20AC${calculatePrice(selectedZone, selectedDuration).toFixed(2)}` : undefined}
              disabled={!selectedDuration}
              loading={sessionLoading}
              onClick={handlePurchase}
            />
          </StepTransition>
        )}
      </div>
    </PhoneFrame>
  );
}
