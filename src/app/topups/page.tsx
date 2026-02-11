"use client";

import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepIndicator } from "@/components/StepIndicator";
import { BrandBadge } from "@/components/BrandBadge";
import { StepTransition, StaggerGrid, StaggerItem } from "@/components/animations";
import { telcoOperators } from "@/data/topups";
import { addTransaction } from "@/lib/store";
import { TelcoOperator } from "@/types";

type Step = "select" | "confirm" | "done";

const TOPUP_STEPS = ["Operator", "Amount", "Phone", "Confirm"];

export default function TopupsPage() {
  const [selectedOperator, setSelectedOperator] = useState<TelcoOperator | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<Step>("select");
  const [loading, setLoading] = useState(false);

  const canPurchase = selectedOperator && selectedAmount && phoneNumber.length >= 6;

  const currentStepIndex = !selectedOperator
    ? 0
    : !selectedAmount
      ? 1
      : phoneNumber.length < 6
        ? 2
        : 3;

  function handlePurchase() {
    if (!selectedOperator || !selectedAmount) return;

    setLoading(true);
    setTimeout(() => {
      addTransaction({
        type: "topup",
        category: "Telco Top-ups",
        title: `${selectedOperator.name} Top-up \u20AC${selectedAmount}`,
        description: `Phone: ${phoneNumber}`,
        amount: selectedAmount,
        currency: "EUR",
      });

      setLoading(false);
      setStep("done");
    }, 1000);
  }

  if (step === "done" && selectedOperator && selectedAmount) {
    return (
      <PhoneFrame>
        <AppHeader title="Top-up" showBack={false} />
        <ConfirmationScreen
          title="Telco Top-up"
          details={[
            { label: "Operator", value: selectedOperator.name },
            { label: "Amount", value: `\u20AC${selectedAmount}` },
            { label: "Phone Number", value: phoneNumber },
          ]}
          amount={`\u20AC${selectedAmount}`}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title="Telco Top-ups" showBack />

      <div className="px-4 pb-6 pt-4">
        <StepIndicator steps={TOPUP_STEPS} currentStep={currentStepIndex} />

        {/* Back button within flow */}
        {selectedOperator && (
          <button
            onClick={() => {
              if (selectedAmount) {
                setSelectedAmount(null);
                setPhoneNumber("");
              } else {
                setSelectedOperator(null);
              }
            }}
            className="mb-4 flex items-center gap-1 text-sm font-medium text-primary transition-colors active:opacity-70"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Operator selection */}
        <StepTransition stepKey="operator">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
            Select Operator
          </p>
          <StaggerGrid className="mb-5 grid grid-cols-3 gap-3">
            {telcoOperators.map((op) => (
              <StaggerItem key={op.id}>
                <button
                  onClick={() => {
                    setSelectedOperator(op);
                    setSelectedAmount(null);
                  }}
                  className={`flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97] ${
                    selectedOperator?.id === op.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <BrandBadge initials={op.logo} color={op.color} size="md" />
                  <span className="text-[12px] font-semibold text-gray-700">{op.name}</span>
                </button>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </StepTransition>

        {/* Amount selection */}
        {selectedOperator && (
          <StepTransition stepKey={`amount-${selectedOperator.id}`}>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
              Select Amount
            </p>
            <div className="mb-5 grid grid-cols-4 gap-2">
              {selectedOperator.amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`rounded-xl bg-white py-3 text-[14px] font-semibold shadow-sm transition-all active:scale-[0.97] ${
                    selectedAmount === amount
                      ? "ring-2 ring-primary text-primary"
                      : "text-gray-700"
                  }`}
                >
                  \u20AC{amount}
                </button>
              ))}
            </div>
          </StepTransition>
        )}

        {/* Phone number input */}
        {selectedAmount && (
          <StepTransition stepKey={`phone-${selectedAmount}`}>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-gray-500">
              Phone Number
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="mb-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </StepTransition>
        )}

        {/* Purchase button */}
        {selectedAmount && (
          <PurchaseButton
            label="Buy Top-up"
            price={`\u20AC${selectedAmount}`}
            disabled={!canPurchase}
            loading={loading}
            onClick={handlePurchase}
          />
        )}
      </div>
    </PhoneFrame>
  );
}
