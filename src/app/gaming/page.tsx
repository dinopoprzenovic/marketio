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
import type { GamingPlatform, VoucherDenomination } from "@/types";
import type { GamingPurchaseRequest, GamingPurchaseResult } from "@/services/gaming";

const GAMING_STEPS = ["Platform", "Voucher", "Confirm"];

export default function GamingPage() {
  const { data: platforms, loading: catalogLoading, error: catalogError, refetch } =
    useServiceQuery<GamingPlatform[]>("/api/gaming");

  const { mutate: purchase, loading: purchaseLoading } =
    useServiceMutation<GamingPurchaseRequest, GamingPurchaseResult>("/api/gaming");

  const [selectedPlatform, setSelectedPlatform] = useState<GamingPlatform | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherDenomination | null>(null);
  const [step, setStep] = useState<"browse" | "confirm" | "done">("browse");
  const [purchaseResult, setPurchaseResult] = useState<GamingPurchaseResult | null>(null);

  const currentStepIndex = !selectedPlatform ? 0 : !selectedVoucher ? 1 : 2;

  const handleSelectPlatform = (platform: GamingPlatform) => {
    setSelectedPlatform(platform);
    setSelectedVoucher(null);
  };

  const handleSelectVoucher = (voucher: VoucherDenomination) => {
    setSelectedVoucher(voucher);
    setStep("confirm");
  };

  const handlePurchase = async () => {
    if (!selectedPlatform || !selectedVoucher) return;

    const result = await purchase({
      platformId: selectedPlatform.id,
      voucherId: selectedVoucher.id,
    });

    if (result) {
      addTransaction({
        type: "voucher",
        category: "Gaming Vouchers",
        title: selectedVoucher.label,
        description: `${selectedPlatform.name} voucher`,
        amount: selectedVoucher.price,
        currency: selectedVoucher.currency,
      });
      setPurchaseResult(result);
      setStep("done");
    }
  };

  const handleBack = () => {
    if (selectedVoucher) {
      setSelectedVoucher(null);
      setStep("browse");
    } else if (selectedPlatform) {
      setSelectedPlatform(null);
    }
  };

  const headerTitle = selectedPlatform ? selectedPlatform.name : "Gaming Vouchers";

  if (step === "done" && selectedPlatform && selectedVoucher && purchaseResult) {
    return (
      <PhoneFrame>
        <ConfirmationScreen
          title="Gaming Voucher Purchased"
          details={[
            { label: "Platform", value: selectedPlatform.name },
            { label: "Voucher", value: selectedVoucher.label },
            { label: "Code", value: purchaseResult.code },
          ]}
          amount={`\u20AC${selectedVoucher.price.toFixed(2)}`}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title={headerTitle} showBack={true} />

      <div className="px-4 py-4">
        {catalogLoading && <LoadingState rows={4} />}
        {catalogError && <ErrorState message={catalogError} onRetry={refetch} />}

        {platforms && (
          <>
            <StepIndicator steps={GAMING_STEPS} currentStep={currentStepIndex} />

            {/* Platform selection */}
            {!selectedPlatform && (
              <StepTransition stepKey="platforms">
                <StaggerGrid className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <StaggerItem key={platform.id}>
                      <button
                        onClick={() => handleSelectPlatform(platform)}
                        className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm transition-all active:scale-[0.97]"
                        style={{ borderBottom: `3px solid ${platform.color}` }}
                      >
                        <BrandBadge initials={platform.icon} color={platform.color} size="lg" />
                        <span className="text-sm font-semibold text-gray-800">{platform.name}</span>
                      </button>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </StepTransition>
            )}

            {/* Voucher selection */}
            {selectedPlatform && !selectedVoucher && (
              <StepTransition stepKey={`vouchers-${selectedPlatform.id}`}>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleBack}
                    className="mb-1 flex items-center gap-1 self-start text-sm font-medium text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    All Platforms
                  </button>

                  {selectedPlatform.vouchers.map((voucher) => (
                    <button
                      key={voucher.id}
                      onClick={() => handleSelectVoucher(voucher)}
                      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97]"
                    >
                      <div className="flex items-center gap-3">
                        <BrandBadge initials={selectedPlatform.icon} color={selectedPlatform.color} size="sm" />
                        <span className="text-sm font-semibold text-gray-800">{voucher.label}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        &euro;{voucher.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </StepTransition>
            )}

            {/* Purchase confirmation */}
            {selectedPlatform && selectedVoucher && step === "confirm" && (
              <StepTransition stepKey="confirm">
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleBack}
                    className="mb-1 flex items-center gap-1 self-start text-sm font-medium text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <BrandBadge initials={selectedPlatform.icon} color={selectedPlatform.color} size="md" />
                      <div>
                        <p className="text-base font-bold text-gray-900">{selectedVoucher.label}</p>
                        <p className="text-sm text-gray-500">{selectedPlatform.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-lg font-bold text-primary">
                        &euro;{selectedVoucher.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <PurchaseButton
                    label="Buy Voucher"
                    price={`\u20AC${selectedVoucher.price.toFixed(2)}`}
                    loading={purchaseLoading}
                    onClick={handlePurchase}
                  />
                </div>
              </StepTransition>
            )}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
