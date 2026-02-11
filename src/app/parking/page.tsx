"use client";

import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepIndicator } from "@/components/StepIndicator";
import { StepTransition, StaggerGrid, StaggerItem } from "@/components/animations";
import { MapPin, Clock } from "lucide-react";
import { parkingZones, parkingDurations } from "@/data/parking";
import { addTransaction } from "@/lib/store";
import { sanitizePlate, isValidPlate } from "@/lib/validation";
import type { ParkingZone } from "@/types";

type Step = "zone" | "plate" | "duration" | "done";

const PARKING_STEPS = ["Zone", "Plate", "Duration", "Confirm"];

function getStepIndex(step: Step): number {
  switch (step) {
    case "zone": return 0;
    case "plate": return 1;
    case "duration": return 2;
    case "done": return 3;
  }
}

function generateTicketNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PKG-${code}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ParkingPage() {
  const [step, setStep] = useState<Step>("zone");
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [plateTouched, setPlateTouched] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<typeof parkingDurations[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  const plateValid = isValidPlate(licensePlate);

  const suggestedZone = parkingZones[1]; // Zone 2 - Inner City

  function handleZoneSelect(zone: ParkingZone) {
    setSelectedZone(zone);
    setStep("plate");
  }

  function handlePlateSubmit() {
    if (!plateValid) return;
    setStep("duration");
  }

  function calculatePrice(zone: ParkingZone, duration: typeof parkingDurations[0]): number {
    return Math.round(zone.hourlyRate * (duration.minutes / 60) * 100) / 100;
  }

  function handlePurchase() {
    if (!selectedZone || !selectedDuration) return;

    setLoading(true);
    const price = calculatePrice(selectedZone, selectedDuration);

    setTimeout(() => {
      addTransaction({
        type: "parking",
        category: "Parking",
        title: `Parking - ${selectedZone.name}`,
        description: `${licensePlate.toUpperCase()} - ${selectedDuration.label}`,
        amount: price,
        currency: "EUR",
      });

      setTicketNumber(generateTicketNumber());
      setLoading(false);
      setStep("done");
    }, 1000);
  }

  function handleBack() {
    if (step === "plate") {
      setStep("zone");
      setSelectedZone(null);
    } else if (step === "duration") {
      setStep("plate");
      setSelectedDuration(null);
    }
  }

  if (step === "done" && selectedZone && selectedDuration) {
    const price = calculatePrice(selectedZone, selectedDuration);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + selectedDuration.minutes * 60 * 1000);

    return (
      <PhoneFrame>
        <AppHeader title="Parking" showBack={false} />
        <ConfirmationScreen
          title="Parking Ticket Active"
          details={[
            { label: "Ticket No.", value: ticketNumber },
            { label: "Zone", value: selectedZone.name },
            { label: "License Plate", value: licensePlate.toUpperCase() },
            { label: "Duration", value: selectedDuration.label },
            { label: "Start", value: formatTime(startTime) },
            { label: "End", value: formatTime(endTime) },
          ]}
          amount={`\u20AC${price.toFixed(2)}`}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title="Parking" showBack={true} />

      <div className="px-4 py-5">
        <StepIndicator steps={PARKING_STEPS} currentStep={getStepIndex(step)} />

        {step !== "zone" && (
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

        {/* Step: Zone selection */}
        {step === "zone" && (
          <StepTransition stepKey="zone">
            {/* GPS suggestion banner */}
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Based on your location:</span>{" "}
                {suggestedZone.name}
              </p>
            </div>

            <h2 className="mb-1 text-lg font-bold text-gray-900">Select Zone</h2>
            <p className="mb-4 text-sm text-gray-500">Choose your parking zone</p>

            <StaggerGrid className="flex flex-col gap-3">
              {parkingZones.map((zone) => (
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
                      <span className="text-sm font-bold" style={{ color: zone.color }}>
                        Z{zone.id.split("-")[1]}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-800">{zone.name}</p>
                      <p className="text-xs text-gray-500">{zone.description}</p>
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

        {/* Step: License plate */}
        {step === "plate" && selectedZone && (
          <StepTransition stepKey="plate">
            <h2 className="mb-1 text-lg font-bold text-gray-900">License Plate</h2>
            <p className="mb-4 text-sm text-gray-500">Enter your vehicle registration number</p>

            <input
              type="text"
              value={licensePlate}
              onChange={(e) => {
                setLicensePlate(sanitizePlate(e.target.value));
                if (!plateTouched) setPlateTouched(true);
              }}
              onBlur={() => setPlateTouched(true)}
              placeholder="e.g. ZG-1234-AB"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-medium uppercase text-gray-900 placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                plateTouched && licensePlate.length > 0 && !plateValid
                  ? "border-red-400 focus:border-red-400 focus:ring-red-300/20"
                  : "border-gray-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {plateTouched && licensePlate.length > 0 && !plateValid ? (
              <p className="mt-1.5 text-xs text-red-500">Min 4 characters — letters, numbers, and hyphens only</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">e.g. ZG-1234-AB</p>
            )}
            <div className="mb-5" />

            <PurchaseButton
              label="Continue"
              disabled={!plateValid}
              onClick={handlePlateSubmit}
            />
          </StepTransition>
        )}

        {/* Step: Duration selection */}
        {step === "duration" && selectedZone && (
          <StepTransition stepKey="duration">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Select Duration</h2>
            <p className="mb-4 text-sm text-gray-500">
              {selectedZone.name} &middot; {licensePlate.toUpperCase()}
            </p>

            <div className="mb-5 flex flex-col gap-2">
              {parkingDurations.map((dur) => {
                const price = calculatePrice(selectedZone, dur);
                const isSelected = selectedDuration?.id === dur.id;
                return (
                  <button
                    key={dur.id}
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

            {/* Summary */}
            {selectedDuration && (
              <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-gray-500">Summary</h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Zone</span>
                    <span className="text-sm font-medium text-gray-800">{selectedZone.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Plate</span>
                    <span className="text-sm font-medium text-gray-800">{licensePlate.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="text-sm font-medium text-gray-800">{selectedDuration.label}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <span className="text-sm font-semibold text-gray-700">Price</span>
                    <span className="text-base font-bold text-primary">
                      &euro;{calculatePrice(selectedZone, selectedDuration).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <PurchaseButton
              label="Pay for Parking"
              price={selectedDuration ? `\u20AC${calculatePrice(selectedZone, selectedDuration).toFixed(2)}` : undefined}
              disabled={!selectedDuration}
              loading={loading}
              onClick={handlePurchase}
            />
          </StepTransition>
        )}
      </div>
    </PhoneFrame>
  );
}
