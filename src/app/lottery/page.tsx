"use client";

import { useState, useCallback } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StaggerGrid, StaggerItem } from "@/components/animations";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { useServiceMutation } from "@/hooks/useServiceMutation";
import { addTransaction } from "@/lib/store";
import type { LotteryProduct } from "@/types";
import type { LotteryPurchaseRequest, LotteryPurchaseResult } from "@/services/lottery";
import {
  CircleDot,
  Star,
  Tv,
  Clover,
  Coins,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const lotteryIconMap: Record<string, LucideIcon> = {
  CircleDot,
  Star,
  Tv,
  Clover,
  Coins,
  CreditCard,
};

function generateQuickPick(): number[] {
  const nums = new Set<number>();
  while (nums.size < 6) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

function LotteryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = lotteryIconMap[iconName];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={2} />;
}

export default function LotteryPage() {
  const { data: products, loading: catalogLoading, error: catalogError, refetch } =
    useServiceQuery<LotteryProduct[]>("/api/lottery");

  const { mutate: purchase, loading: purchaseLoading } =
    useServiceMutation<LotteryPurchaseRequest, LotteryPurchaseResult>("/api/lottery");

  const [selectedProduct, setSelectedProduct] = useState<LotteryProduct | null>(null);
  const [step, setStep] = useState<"browse" | "done">("browse");
  const [quickPick, setQuickPick] = useState<number[]>([]);
  const [purchaseResult, setPurchaseResult] = useState<LotteryPurchaseResult | null>(null);

  const lotteryItems = products?.filter((p) => p.type === "lottery") ?? [];
  const paysafeItems = products?.filter((p) => p.type === "paysafe") ?? [];

  const handleSelect = useCallback((product: LotteryProduct) => {
    setSelectedProduct(product);
    if (product.type === "lottery" && !product.id.startsWith("scratch")) {
      setQuickPick(generateQuickPick());
    } else {
      setQuickPick([]);
    }
  }, []);

  const handleDeselect = () => {
    setSelectedProduct(null);
    setQuickPick([]);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    const result = await purchase({
      productId: selectedProduct.id,
      quickPick: quickPick.length > 0 ? quickPick : undefined,
    });

    if (result) {
      addTransaction({
        type: selectedProduct.type === "lottery" ? "lottery" : "paysafe",
        category: "Lottery & Paysafe",
        title: selectedProduct.name,
        description: selectedProduct.description,
        amount: selectedProduct.price,
        currency: "EUR",
      });
      setPurchaseResult(result);
      setStep("done");
    }
  };

  const handleRefreshPick = () => {
    setQuickPick(generateQuickPick());
  };

  if (step === "done" && purchaseResult && selectedProduct) {
    const details: { label: string; value: string }[] = [
      { label: "Product", value: purchaseResult.product },
    ];

    if (purchaseResult.ticketNumber) {
      details.push({ label: "Ticket No.", value: purchaseResult.ticketNumber });
    }
    if (purchaseResult.drawDate) {
      details.push({ label: "Draw Date", value: purchaseResult.drawDate });
    }
    if (purchaseResult.quickPick && purchaseResult.quickPick.length > 0) {
      details.push({ label: "Quick Pick", value: purchaseResult.quickPick.join(", ") });
    }
    if (purchaseResult.pin) {
      details.push({ label: "PIN", value: purchaseResult.pin });
    }
    if (purchaseResult.serial) {
      details.push({ label: "Serial", value: purchaseResult.serial });
    }
    if (selectedProduct.type === "lottery" && selectedProduct.id.startsWith("scratch")) {
      details.push({ label: "Type", value: "Instant Scratch Card" });
    }

    return (
      <PhoneFrame>
        <ConfirmationScreen
          title={`${purchaseResult.product} Purchased`}
          details={details}
          amount={`\u20AC${purchaseResult.amount.toFixed(2)}`}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title="Lottery & Paysafe" showBack={true} />

      <div className="px-4 py-4">
        {catalogLoading && <LoadingState rows={5} />}
        {catalogError && <ErrorState message={catalogError} onRetry={refetch} />}

        {products && (
          <>
            {/* Croatian Lottery section */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Croatian Lottery
            </p>
            <StaggerGrid className="mb-6 flex flex-col gap-3">
              {lotteryItems.map((product) => (
                <StaggerItem key={product.id}>
                  <button
                    onClick={() => handleSelect(product)}
                    className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97] ${
                      selectedProduct?.id === product.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                      <LotteryIcon iconName={product.icon} className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      &euro;{product.price.toFixed(2)}
                    </span>
                  </button>
                </StaggerItem>
              ))}
            </StaggerGrid>

            {/* Paysafecard section */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Paysafecard
            </p>
            <StaggerGrid className="mb-6 flex flex-col gap-3" staggerDelay={0.05}>
              {paysafeItems.map((product) => (
                <StaggerItem key={product.id}>
                  <button
                    onClick={() => handleSelect(product)}
                    className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97] ${
                      selectedProduct?.id === product.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <LotteryIcon iconName={product.icon} className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      &euro;{product.price.toFixed(2)}
                    </span>
                  </button>
                </StaggerItem>
              ))}
            </StaggerGrid>

            {/* Selected product detail panel */}
            {selectedProduct && (
              <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white px-4 pb-6 pt-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      selectedProduct.type === "lottery" ? "bg-amber-50" : "bg-blue-50"
                    }`}
                  >
                    <LotteryIcon
                      iconName={selectedProduct.icon}
                      className={`h-6 w-6 ${selectedProduct.type === "lottery" ? "text-amber-600" : "text-blue-600"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base font-bold text-gray-900">{selectedProduct.name}</p>
                        <p className="text-xs text-gray-500">{selectedProduct.description}</p>
                      </div>
                      <button
                        onClick={handleDeselect}
                        className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Quick Pick for non-scratch lottery */}
                    {selectedProduct.type === "lottery" &&
                      !selectedProduct.id.startsWith("scratch") && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">Quick Pick</span>
                            <button
                              onClick={handleRefreshPick}
                              className="text-xs font-medium text-primary"
                            >
                              Refresh
                            </button>
                          </div>
                          <div className="mt-1.5 flex gap-1.5">
                            {quickPick.map((n, i) => (
                              <span
                                key={i}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Scratch card info */}
                    {selectedProduct.type === "lottery" &&
                      selectedProduct.id.startsWith("scratch") && (
                        <p className="mt-2 text-xs font-medium text-amber-600">
                          Instant scratch card -- results revealed immediately
                        </p>
                      )}

                    {/* Paysafe denomination */}
                    {selectedProduct.type === "paysafe" && (
                      <p className="mt-2 text-xs font-medium text-blue-600">
                        Denomination: &euro;{selectedProduct.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <PurchaseButton
                  label="Buy"
                  price={`\u20AC${selectedProduct.price.toFixed(2)}`}
                  loading={purchaseLoading}
                  onClick={handlePurchase}
                />
              </div>
            )}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
