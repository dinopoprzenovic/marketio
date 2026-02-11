"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Bike, Plus, Trash2, Check } from "lucide-react";
import { getSavedVehicles, saveVehicle, deleteSavedVehicle, hasVehicleWithPlate } from "@/lib/store";
import { sanitizePlate, isValidPlate } from "@/lib/validation";
import type { SavedVehicle } from "@/types";

interface VehiclePickerProps {
  vehicleType?: "car" | "motorcycle";
  selectedPlate: string;
  onPlateChange: (plate: string) => void;
  onValidChange: (valid: boolean) => void;
}

export function VehiclePicker({
  vehicleType = "car",
  selectedPlate,
  onPlateChange,
  onValidChange,
}: VehiclePickerProps) {
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [mode, setMode] = useState<"saved" | "new">("saved");
  const [plateTouched, setPlateTouched] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    setVehicles(getSavedVehicles());
  }, []);

  const plateValid = isValidPlate(selectedPlate);

  useEffect(() => {
    onValidChange(plateValid);
  }, [plateValid, onValidChange]);

  // Auto-switch to "new" if no saved vehicles
  useEffect(() => {
    if (vehicles.length === 0) setMode("new");
  }, [vehicles]);

  function handleSelectSaved(vehicle: SavedVehicle) {
    onPlateChange(vehicle.plate);
    setPlateTouched(true);
  }

  function handleDeleteVehicle(id: string) {
    deleteSavedVehicle(id);
    setVehicles(getSavedVehicles());
    if (vehicles.length <= 1) setMode("new");
  }

  function handleSaveVehicle() {
    if (!plateValid || hasVehicleWithPlate(selectedPlate)) return;
    saveVehicle(selectedPlate, nickname || selectedPlate, vehicleType);
    setVehicles(getSavedVehicles());
    setShowSavePrompt(false);
    setNickname("");
  }

  const VehicleIcon = vehicleType === "motorcycle" ? Bike : Car;

  return (
    <div>
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
        Vehicle
      </p>

      {/* Saved vehicles */}
      {vehicles.length > 0 && mode === "saved" && (
        <div className="mb-3 flex flex-col gap-2">
          {vehicles.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-all ${
                selectedPlate === v.plate ? "ring-2 ring-primary" : ""
              }`}
            >
              <button
                onClick={() => handleSelectSaved(v)}
                className="flex flex-1 items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <VehicleIcon className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{v.nickname}</p>
                  <p className="text-xs text-gray-500">{v.plate}</p>
                </div>
                {selectedPlate === v.plate && (
                  <Check className="ml-auto h-5 w-5 text-primary" strokeWidth={2} />
                )}
              </button>
              <button
                onClick={() => handleDeleteVehicle(v.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </motion.div>
          ))}

          <button
            onClick={() => {
              setMode("new");
              onPlateChange("");
              setPlateTouched(false);
            }}
            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            New plate
          </button>
        </div>
      )}

      {/* New plate input */}
      {mode === "new" && (
        <div>
          {vehicles.length > 0 && (
            <button
              onClick={() => setMode("saved")}
              className="mb-3 flex items-center gap-1 text-sm font-medium text-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Saved vehicles
            </button>
          )}

          <input
            type="text"
            value={selectedPlate}
            onChange={(e) => {
              onPlateChange(sanitizePlate(e.target.value));
              if (!plateTouched) setPlateTouched(true);
            }}
            onBlur={() => setPlateTouched(true)}
            placeholder="e.g. ZG-1234-AB"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-medium uppercase text-gray-900 placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
              plateTouched && selectedPlate.length > 0 && !plateValid
                ? "border-red-400 focus:border-red-400 focus:ring-red-300/20"
                : "border-gray-200 focus:border-primary focus:ring-primary/20"
            }`}
          />
          {plateTouched && selectedPlate.length > 0 && !plateValid ? (
            <p className="mt-1.5 text-xs text-red-500">Min 4 characters — letters, numbers, and hyphens only</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-400">e.g. ZG-1234-AB</p>
          )}
        </div>
      )}

      {/* Save vehicle prompt (shown after purchase via parent) */}
      <AnimatePresence>
        {showSavePrompt && plateValid && !hasVehicleWithPlate(selectedPlate) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-xl bg-blue-50 p-3"
          >
            <p className="mb-2 text-sm font-medium text-blue-800">Save this vehicle?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname (optional)"
                className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400"
              />
              <button
                onClick={handleSaveVehicle}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all active:scale-[0.97]"
              >
                Save
              </button>
            </div>
            <button
              onClick={() => setShowSavePrompt(false)}
              className="mt-1.5 text-xs text-blue-600"
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Trigger save prompt externally (e.g., after successful purchase) */
VehiclePicker.triggerSavePrompt = "__vehiclePicker_save__";
