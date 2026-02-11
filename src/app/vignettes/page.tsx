"use client";

import { useState, useCallback } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepIndicator } from "@/components/StepIndicator";
import { VehiclePicker } from "@/components/VehiclePicker";
import { DatePicker } from "@/components/DatePicker";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StepTransition, StaggerGrid, StaggerItem } from "@/components/animations";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { useServiceMutation } from "@/hooks/useServiceMutation";
import { addTransaction, hasVehicleWithPlate, saveVehicle } from "@/lib/store";
import { Car, Bike } from "lucide-react";
import type { VignetteCountry, VehicleType, VignetteDuration, VignetteOrderStatus } from "@/types";
import type { VignettePurchaseRequest, VignettePurchaseResult } from "@/services/vignettes";

type Step = "country" | "vehicle" | "duration" | "plate" | "date" | "done";

function getStepIndex(step: Step, hasMultipleVehicles: boolean): number {
  if (hasMultipleVehicles) {
    switch (step) {
      case "country": return 0;
      case "vehicle": return 1;
      case "duration": return 2;
      case "plate": return 3;
      case "date": return 4;
      case "done": return 5;
    }
  } else {
    switch (step) {
      case "country": return 0;
      case "vehicle": return 0;
      case "duration": return 1;
      case "plate": return 2;
      case "date": return 3;
      case "done": return 4;
    }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status: VignetteOrderStatus): { label: string; color: "green" | "amber" | "blue" | "red" | "gray" } {
  switch (status) {
    case "ACTIVE": return { label: "ACTIVE", color: "green" };
    case "WILL_BE_ACTIVE": return { label: "WILL BE ACTIVE", color: "blue" };
    case "PENDING": return { label: "PENDING", color: "amber" };
    case "EXPIRED": return { label: "EXPIRED", color: "gray" };
    case "REFUNDED": return { label: "REFUNDED", color: "red" };
    case "DELETED": return { label: "DELETED", color: "red" };
  }
}

export default function VignettesPage() {
  const { data: countries, loading: catalogLoading, error: catalogError, refetch } =
    useServiceQuery<VignetteCountry[]>("/api/vignettes");

  const { mutate: purchase, loading: purchaseLoading } =
    useServiceMutation<VignettePurchaseRequest, VignettePurchaseResult>("/api/vignettes");

  const [step, setStep] = useState<Step>("country");
  const [selectedCountry, setSelectedCountry] = useState<VignetteCountry | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<VignetteDuration | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [plateValid, setPlateValid] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [purchaseResult, setPurchaseResult] = useState<VignettePurchaseResult | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveNickname, setSaveNickname] = useState("");

  const onPlateChange = useCallback((plate: string) => setLicensePlate(plate), []);
  const onValidChange = useCallback((valid: boolean) => setPlateValid(valid), []);

  const hasMultipleVehicles = (selectedCountry?.vehicleTypes.length ?? 0) > 1;

  function handleCountrySelect(country: VignetteCountry) {
    setSelectedCountry(country);
    setSelectedVehicleType(null);
    setSelectedDuration(null);
    if (country.vehicleTypes.length === 1) {
      setSelectedVehicleType(country.vehicleTypes[0]);
      setStep("duration");
    } else {
      setStep("vehicle");
    }
  }

  function handleVehicleSelect(vehicle: VehicleType) {
    setSelectedVehicleType(vehicle);
    setSelectedDuration(null);
    setStep("duration");
  }

  function handleDurationSelect(duration: VignetteDuration) {
    setSelectedDuration(duration);
    setStep("plate");
  }

  function handlePlateContinue() {
    if (!plateValid) return;
    setStep("date");
  }

  async function handlePurchase() {
    if (!selectedCountry || !selectedVehicleType || !selectedDuration) return;

    const result = await purchase({
      countryId: selectedCountry.id,
      vehicleTypeId: selectedVehicleType.id,
      durationId: selectedDuration.id,
      licensePlate,
      startDate: startDate.toISOString(),
    });

    if (result) {
      addTransaction({
        type: "vignette",
        category: "Highway Vignettes",
        title: `${selectedCountry.name} ${selectedDuration.label} Vignette`,
        description: `${selectedVehicleType.label} - ${licensePlate.toUpperCase()}`,
        amount: selectedDuration.price,
        currency: selectedCountry.currency,
      });
      setPurchaseResult(result);
      if (!hasVehicleWithPlate(licensePlate)) {
        setShowSavePrompt(true);
      }
      setStep("done");
    }
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
        setSelectedVehicleType(null);
      }
    } else if (step === "plate") {
      setStep("duration");
      setSelectedDuration(null);
    } else if (step === "date") {
      setStep("plate");
    }
  }

  function handleSaveVehicle() {
    const vType = selectedVehicleType?.id === "motorcycle" ? "motorcycle" : "car";
    if (!hasVehicleWithPlate(licensePlate)) {
      saveVehicle(licensePlate, saveNickname || licensePlate, vType as "car" | "motorcycle");
    }
    setShowSavePrompt(false);
    setSaveNickname("");
  }

  const stepsArray = hasMultipleVehicles
    ? ["Country", "Vehicle", "Duration", "Plate", "Date", "Confirm"]
    : ["Country", "Duration", "Plate", "Date", "Confirm"];

  if (step === "done" && purchaseResult && selectedCountry && selectedVehicleType && selectedDuration) {
    return (
      <PhoneFrame>
        <AppHeader title="Highway Vignettes" showBack={false} />
        <ConfirmationScreen
          title={`${selectedCountry.name} ${selectedDuration.label} Vignette`}
          statusBadge={getStatusBadge(purchaseResult.status)}
          details={[
            { label: "Vignette ID", value: purchaseResult.vignetteId },
            { label: "Country", value: `${selectedCountry.flag} ${selectedCountry.name}` },
            { label: "Vehicle Type", value: selectedVehicleType.label },
            { label: "Duration", value: selectedDuration.label },
            { label: "License Plate", value: purchaseResult.licensePlate },
            { label: "Valid From", value: formatDate(purchaseResult.startDate) },
            { label: "Valid Until", value: formatDate(purchaseResult.endDate) },
          ]}
          amount={`${selectedCountry.currency === "EUR" ? "\u20AC" : selectedCountry.currency}${selectedDuration.price.toFixed(2)}`}
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
      <AppHeader title="Highway Vignettes" showBack={true} />
      <div className="px-4 py-5">
        {catalogLoading && <LoadingState rows={5} />}
        {catalogError && <ErrorState message={catalogError} onRetry={refetch} />}

        {countries && (
          <>
            <StepIndicator
              steps={stepsArray}
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
                  {countries.map((country) => (
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
            {step === "duration" && selectedCountry && selectedVehicleType && (
              <StepTransition stepKey="duration">
                <h2 className="mb-1 text-lg font-bold text-gray-900">Select Duration</h2>
                <p className="mb-4 text-sm text-gray-500">
                  {selectedCountry.flag} {selectedCountry.name} &middot;{" "}
                  {selectedVehicleType.id === "motorcycle" ? (
                    <Bike className="mb-0.5 inline h-4 w-4" />
                  ) : (
                    <Car className="mb-0.5 inline h-4 w-4" />
                  )}{" "}
                  {selectedVehicleType.label}
                </p>
                <div className="flex flex-col gap-2">
                  {selectedVehicleType.durations.map((duration) => (
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

            {/* Step: License plate / vehicle picker */}
            {step === "plate" && selectedCountry && selectedVehicleType && selectedDuration && (
              <StepTransition stepKey="plate">
                <h2 className="mb-1 text-lg font-bold text-gray-900">Vehicle</h2>
                <p className="mb-4 text-sm text-gray-500">Select or enter your vehicle registration</p>

                <VehiclePicker
                  vehicleType={selectedVehicleType.id === "motorcycle" ? "motorcycle" : "car"}
                  selectedPlate={licensePlate}
                  onPlateChange={onPlateChange}
                  onValidChange={onValidChange}
                />
                <div className="mb-5" />

                <PurchaseButton
                  label="Continue"
                  disabled={!plateValid}
                  onClick={handlePlateContinue}
                />
              </StepTransition>
            )}

            {/* Step: Start date */}
            {step === "date" && selectedCountry && selectedVehicleType && selectedDuration && (
              <StepTransition stepKey="date">
                <DatePicker
                  selectedDate={startDate}
                  onDateChange={setStartDate}
                  minDate={new Date()}
                />
                <div className="mb-5" />

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
                      <span className="text-sm font-medium text-gray-800">{selectedVehicleType.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Duration</span>
                      <span className="text-sm font-medium text-gray-800">{selectedDuration.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plate</span>
                      <span className="text-sm font-medium text-gray-800">{licensePlate.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Starts</span>
                      <span className="text-sm font-medium text-gray-800">
                        {startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
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
                  loading={purchaseLoading}
                  onClick={handlePurchase}
                />
              </StepTransition>
            )}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
