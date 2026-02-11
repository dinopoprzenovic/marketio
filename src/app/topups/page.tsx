"use client";

import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepIndicator } from "@/components/StepIndicator";
import { BrandBadge } from "@/components/BrandBadge";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StepTransition, StaggerGrid, StaggerItem } from "@/components/animations";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { useServiceMutation } from "@/hooks/useServiceMutation";
import { addTransaction } from "@/lib/store";
import { formatPhoneNumber, isValidPhone } from "@/lib/validation";
import type { TelcoOperator } from "@/types";
import type { TopupPurchaseRequest, TopupPurchaseResult } from "@/services/topups";

type Step = "select" | "confirm" | "done";

const TOPUP_STEPS = ["Operator", "Amount", "Phone", "Confirm"];

export default function TopupsPage() {
  const { data: operators, loading: catalogLoading, error: catalogError, refetch } =
    useServiceQuery<TelcoOperator[]>("/api/topups");

  const { mutate: purchase, loading: purchaseLoading } =
    useServiceMutation<TopupPurchaseRequest, TopupPurchaseResult>("/api/topups");

  const [selectedOperator, setSelectedOperator] = useState<TelcoOperator | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [step, setStep] = useState<Step>("select");

  const phoneValid = isValidPhone(phoneNumber);
  const canPurchase = selectedOperator && selectedAmount && phoneValid;

  const currentStepIndex = !selectedOperator
    ? 0
    : !selectedAmount
      ? 1
      : !phoneValid
        ? 2
        : 3;

  async function handlePurchase() {
    if (!selectedOperator || !selectedAmount) return;

    const result = await purchase({
      operatorId: selectedOperator.id,
      amount: selectedAmount,
      phoneNumber,
    });

    if (result) {
      addTransaction({
        type: "topup",
        category: "Telco Top-ups",
        title: `${selectedOperator.name} Top-up \u20AC${selectedAmount}`,
        description: `Phone: ${phoneNumber}`,
        amount: selectedAmount,
        currency: "EUR",
      });
      setStep("done");
    }
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
        {catalogLoading && <LoadingState rows={3} />}
        {catalogError && <ErrorState message={catalogError} onRetry={refetch} />}

        {operators && (
          <>
            <StepIndicator steps={TOPUP_STEPS} currentStep={currentStepIndex} />

            {/* Back button within flow */}
            {selectedOperator && (
              <button
                onClick={() => {
                  if (selectedAmount) {
                    setSelectedAmount(null);
                    setPhoneNumber("");
                    setPhoneTouched(false);
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
                {operators.map((op) => (
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
                      &euro;{amount}
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
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setPhoneNumber(formatted);
                    if (!phoneTouched) setPhoneTouched(true);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="+385 91 234 567"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-gray-800 placeholder-gray-400 outline-none transition-colors focus:ring-1 ${
                    phoneTouched && phoneNumber.length > 0 && !phoneValid
                      ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                      : "border-gray-200 focus:border-primary focus:ring-primary"
                  }`}
                />
                {phoneTouched && phoneNumber.length > 0 && !phoneValid && (
                  <p className="mt-1.5 text-xs text-red-500">Enter a valid phone number</p>
                )}
                <div className="mb-5" />
              </StepTransition>
            )}

            {/* Purchase button */}
            {selectedAmount && (
              <PurchaseButton
                label="Buy Top-up"
                price={`\u20AC${selectedAmount}`}
                disabled={!canPurchase}
                loading={purchaseLoading}
                onClick={handlePurchase}
              />
            )}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
