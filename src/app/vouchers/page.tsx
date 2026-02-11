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
import type { RetailBrand } from "@/types";
import type { VoucherPurchaseRequest, VoucherPurchaseResult } from "@/services/vouchers";

const VOUCHER_STEPS = ["Brand", "Amount", "Confirm"];

export default function VouchersPage() {
  const { data: brands, loading: catalogLoading, error: catalogError, refetch } =
    useServiceQuery<RetailBrand[]>("/api/vouchers");

  const { mutate: purchase, loading: purchaseLoading } =
    useServiceMutation<VoucherPurchaseRequest, VoucherPurchaseResult>("/api/vouchers");

  const [selectedBrand, setSelectedBrand] = useState<RetailBrand | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [step, setStep] = useState<"browse" | "confirm" | "done">("browse");
  const [purchaseResult, setPurchaseResult] = useState<VoucherPurchaseResult | null>(null);

  const currentStepIndex = !selectedBrand ? 0 : !selectedAmount ? 1 : 2;

  const handleSelectBrand = (brand: RetailBrand) => {
    setSelectedBrand(brand);
    setSelectedAmount(null);
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setStep("confirm");
  };

  const handlePurchase = async () => {
    if (!selectedBrand || !selectedAmount) return;

    const result = await purchase({
      brandId: selectedBrand.id,
      amount: selectedAmount,
    });

    if (result) {
      addTransaction({
        type: "voucher",
        category: "Gift Cards",
        title: `${selectedBrand.name} \u20AC${selectedAmount}`,
        description: `${selectedBrand.name} gift card`,
        amount: selectedAmount,
        currency: "EUR",
      });
      setPurchaseResult(result);
      setStep("done");
    }
  };

  const handleBack = () => {
    if (selectedAmount) {
      setSelectedAmount(null);
      setStep("browse");
    } else if (selectedBrand) {
      setSelectedBrand(null);
    }
  };

  const headerTitle = selectedBrand ? selectedBrand.name : "Gift Cards";

  if (step === "done" && selectedBrand && selectedAmount && purchaseResult) {
    return (
      <PhoneFrame>
        <ConfirmationScreen
          title="Gift Card Purchased"
          details={[
            { label: "Brand", value: selectedBrand.name },
            { label: "Amount", value: `\u20AC${selectedAmount.toFixed(2)}` },
            { label: "Redemption Code", value: purchaseResult.redemptionCode },
          ]}
          amount={`\u20AC${selectedAmount.toFixed(2)}`}
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

        {brands && (
          <>
            <StepIndicator steps={VOUCHER_STEPS} currentStep={currentStepIndex} />

            {/* Brand selection */}
            {!selectedBrand && (
              <StepTransition stepKey="brands">
                <StaggerGrid className="grid grid-cols-2 gap-3">
                  {brands.map((brand) => (
                    <StaggerItem key={brand.id}>
                      <button
                        onClick={() => handleSelectBrand(brand)}
                        className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm transition-all active:scale-[0.97]"
                        style={{ borderBottom: `3px solid ${brand.color}` }}
                      >
                        <BrandBadge initials={brand.icon} color={brand.color} size="lg" />
                        <span className="text-sm font-semibold text-gray-800">{brand.name}</span>
                      </button>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </StepTransition>
            )}

            {/* Amount selection */}
            {selectedBrand && !selectedAmount && (
              <StepTransition stepKey={`amounts-${selectedBrand.id}`}>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleBack}
                    className="mb-1 flex items-center gap-1 self-start text-sm font-medium text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    All Brands
                  </button>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <BrandBadge initials={selectedBrand.icon} color={selectedBrand.color} size="md" />
                      <div>
                        <p className="text-base font-bold text-gray-900">{selectedBrand.name}</p>
                        <p className="text-sm text-gray-500">Select an amount</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedBrand.amounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleSelectAmount(amount)}
                          className="rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-bold text-gray-800 transition-all hover:border-primary hover:text-primary active:scale-[0.97]"
                        >
                          &euro;{amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepTransition>
            )}

            {/* Purchase confirmation */}
            {selectedBrand && selectedAmount && step === "confirm" && (
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
                      <BrandBadge initials={selectedBrand.icon} color={selectedBrand.color} size="md" />
                      <div>
                        <p className="text-base font-bold text-gray-900">{selectedBrand.name} Gift Card</p>
                        <p className="text-sm text-gray-500">&euro;{selectedAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-lg font-bold text-primary">
                        &euro;{selectedAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <PurchaseButton
                    label="Buy Gift Card"
                    price={`\u20AC${selectedAmount.toFixed(2)}`}
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
