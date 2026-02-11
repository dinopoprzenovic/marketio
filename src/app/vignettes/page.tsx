"use client";

import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepIndicator } from "@/components/StepIndicator";
import { StepTransition, StaggerGrid, StaggerItem } from "@/components/animations";
import { Car, Bike } from "lucide-react";
import { vignetteCountries } from "@/data/vignettes";
import { addTransaction } from "@/lib/store";
import type { VignetteCountry, VehicleType, VignetteDuration } from "@/types";

type Step = "country" | "vehicle" | "duration" | "plate" | "done";

const VIGNETTE_STEPS = ["Country", "Vehicle", "Duration", "Plate", "Confirm"];

function getStepIndex(step: Step, hasMultipleVehicles: boolean): number {
  if (hasMultipleVehicles) {
    switch (step) {
      case "country": return 0;
      case "vehicle": return 1;
      case "duration": return 2;
      case "plate": return 3;
      case "done": return 4;
    }
  } else {
    switch (step) {
      case "country": return 0;
      case "vehicle": return 0;
      case "duration": return 1;
      case "plate": return 2;
      case "done": return 3;
    }
  }
}

function computeValidUntil(durationLabel: string): string {
  const now = new Date();
  const label = durationLabel.toLowerCase();

  if (label.includes("7 day") || label.includes("weekend")) {
    now.setDate(now.getDate() + 7);
  } else if (label.includes("10 day")) {
    now.setDate(now.getDate() + 10);
  } else if (label.includes("30 day")) {
    now.setDate(now.getDate() + 30);
  } else if (label.includes("2 month")) {
    now.setMonth(now.getMonth() + 2);
  } else if (label.includes("3 month")) {
    now.setMonth(now.getMonth() + 3);
  } else if (label.includes("1 month")) {
    now.setMonth(now.getMonth() + 1);
  } else if (label.includes("1 year")) {
    now.setFullYear(now.getFullYear() + 1);
  }

  return now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateVignetteId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VIG-2026-${suffix}`;
}

export default function VignettesPage() {
  const [step, setStep] = useState<Step>("country");
  const [selectedCountry, setSelectedCountry] = useState<VignetteCountry | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<VignetteDuration | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [vignetteId, setVignetteId] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMultipleVehicles = (selectedCountry?.vehicleTypes.length ?? 0) > 1;

  function handleCountrySelect(country: VignetteCountry) {
    setSelectedCountry(country);
    setSelectedVehicle(null);
    setSelectedDuration(null);
    if (country.vehicleTypes.length === 1) {
      setSelectedVehicle(country.vehicleTypes[0]);
      setStep("duration");
    } else {
      setStep("vehicle");
    }
  }

  function handleVehicleSelect(vehicle: VehicleType) {
    setSelectedVehicle(vehicle);
    setSelectedDuration(null);
    setStep("duration");
  }

  function handleDurationSelect(duration: VignetteDuration) {
    setSelectedDuration(duration);
    setStep("plate");
  }

  function handlePurchase() {
    if (!selectedCountry || !selectedVehicle || !selectedDuration) return;

    setLoading(true);
    setTimeout(() => {
      addTransaction({
        type: "vignette",
        category: "Highway Vignettes",
        title: `${selectedCountry.name} ${selectedDuration.label} Vignette`,
        description: `${selectedVehicle.label} - ${licensePlate.toUpperCase()}`,
        amount: selectedDuration.price,
        currency: selectedCountry.currency,
      });

      setVignetteId(generateVignetteId());
      setLoading(false);
      setStep("done");
    }, 1000);
  }

  function handleBack() {
    if (step === "vehicle") {
      setStep("country");
      setSelectedCountry(null);
    } else if (step === "duration") {
      if (selectedCountry && selectedCountry.vehicleTypes.length === 1) {
        setStep("country");
        setSelectedCountry(null);
      } else {
        setStep("vehicle");
        setSelectedVehicle(null);
      }
    } else if (step === "plate") {
      setStep("duration");
      setSelectedDuration(null);
    }
  }

  if (step === "done" && selectedCountry && selectedVehicle && selectedDuration) {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const validUntil = computeValidUntil(selectedDuration.label);

    return (
      <PhoneFrame>
        <AppHeader title="Highway Vignettes" showBack={false} />
        <ConfirmationScreen
          title={`${selectedCountry.name} ${selectedDuration.label} Vignette`}
          details={[
            { label: "Vignette ID", value: vignetteId },
            { label: "Country", value: `${selectedCountry.flag} ${selectedCountry.name}` },
            { label: "Vehicle Type", value: selectedVehicle.label },
            { label: "Duration", value: selectedDuration.label },
            { label: "License Plate", value: licensePlate.toUpperCase() },
            { label: "Valid From", value: today },
            { label: "Valid Until", value: validUntil },
          ]}
          amount={`${selectedCountry.currency === "EUR" ? "\u20AC" : selectedCountry.currency}${selectedDuration.price.toFixed(2)}`}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title="Highway Vignettes" showBack={true} />
      <div className="px-4 py-5">
        <StepIndicator
          steps={hasMultipleVehicles ? VIGNETTE_STEPS : ["Country", "Duration", "Plate", "Confirm"]}
          currentStep={getStepIndex(step, hasMultipleVehicles)}
        />

        {step !== "country" && (
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

        {/* Step: Country selection */}
        {step === "country" && (
          <StepTransition stepKey="country">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Select Country</h2>
            <p className="mb-4 text-sm text-gray-500">Choose where you need a vignette</p>
            <StaggerGrid className="grid grid-cols-2 gap-3">
              {vignetteCountries.map((country) => (
                <StaggerItem key={country.id}>
                  <button
                    onClick={() => handleCountrySelect(country)}
                    className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97]"
                  >
                    <span className="text-3xl">{country.flag}</span>
                    <span className="text-sm font-medium text-gray-800">{country.name}</span>
                  </button>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </StepTransition>
        )}

        {/* Step: Vehicle type selection */}
        {step === "vehicle" && selectedCountry && (
          <StepTransition stepKey="vehicle">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Vehicle Type</h2>
            <p className="mb-4 text-sm text-gray-500">
              {selectedCountry.flag} {selectedCountry.name}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {selectedCountry.vehicleTypes.map((vehicle) => {
                const VehicleIcon = vehicle.id === "motorcycle" ? Bike : Car;
                return (
                  <button
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm transition-all active:scale-[0.97]"
                  >
                    <VehicleIcon className="h-8 w-8 text-gray-700" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-gray-800">{vehicle.label}</span>
                  </button>
                );
              })}
            </div>
          </StepTransition>
        )}

        {/* Step: Duration selection */}
        {step === "duration" && selectedCountry && selectedVehicle && (
          <StepTransition stepKey="duration">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Select Duration</h2>
            <p className="mb-4 text-sm text-gray-500">
              {selectedCountry.flag} {selectedCountry.name} &middot;{" "}
              {selectedVehicle.id === "motorcycle" ? (
                <Bike className="mb-0.5 inline h-4 w-4" />
              ) : (
                <Car className="mb-0.5 inline h-4 w-4" />
              )}{" "}
              {selectedVehicle.label}
            </p>
            <div className="flex flex-col gap-2">
              {selectedVehicle.durations.map((duration) => (
                <button
                  key={duration.id}
                  onClick={() => handleDurationSelect(duration)}
                  className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm transition-all active:scale-[0.98]"
                >
                  <span className="text-[15px] font-medium text-gray-800">{duration.label}</span>
                  <span className="text-[15px] font-bold text-primary">
                    {selectedCountry.currency === "EUR" ? "\u20AC" : selectedCountry.currency}
                    {duration.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </StepTransition>
        )}

        {/* Step: License plate input */}
        {step === "plate" && selectedCountry && selectedVehicle && selectedDuration && (
          <StepTransition stepKey="plate">
            <h2 className="mb-1 text-lg font-bold text-gray-900">License Plate</h2>
            <p className="mb-4 text-sm text-gray-500">Enter your vehicle registration number</p>

            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="e.g. ZG-1234-AB"
              className="mb-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-medium uppercase text-gray-900 placeholder:normal-case placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* Summary card */}
            <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-500">Purchase Summary</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Country</span>
                  <span className="text-sm font-medium text-gray-800">
                    {selectedCountry.flag} {selectedCountry.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Vehicle</span>
                  <span className="text-sm font-medium text-gray-800">{selectedVehicle.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium text-gray-800">{selectedDuration.label}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                  <span className="text-sm font-semibold text-gray-700">Price</span>
                  <span className="text-base font-bold text-primary">
                    {selectedCountry.currency === "EUR" ? "\u20AC" : selectedCountry.currency}
                    {selectedDuration.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <PurchaseButton
              label="Buy Vignette"
              price={`${selectedCountry.currency === "EUR" ? "\u20AC" : selectedCountry.currency}${selectedDuration.price.toFixed(2)}`}
              disabled={licensePlate.trim().length === 0}
              loading={loading}
              onClick={handlePurchase}
            />
          </StepTransition>
        )}
      </div>
    </PhoneFrame>
  );
}
