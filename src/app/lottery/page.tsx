"use client";

import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseButton } from "@/components/PurchaseButton";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StaggerGrid, StaggerItem } from "@/components/animations";
import { lotteryProducts } from "@/data/lottery";
import { addTransaction } from "@/lib/store";
import type { LotteryProduct } from "@/types";
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

type Step = "browse" | "done";

function generateTicketNumber(): string {
  const digits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join("");
  return `HR-LOT-${digits}`;
}

function generatePaysafePin(): string {
  const groups = Array.from({ length: 4 }, () =>
    String(Math.floor(Math.random() * 10000)).padStart(4, "0")
  );
  return groups.join(" ");
}

function generateSerial(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `SER-${rand}`;
}

function getNextDrawDate(product: LotteryProduct): string {
  const now = new Date();
  const dayOfWeek = now.getDay();

  let targetDays: number[];
  if (product.id === "eurojackpot") {
    targetDays = [2, 5];
  } else if (product.id === "bingo") {
    targetDays = [1];
  } else {
    targetDays = [3, 6];
  }

  for (let offset = 1; offset <= 7; offset++) {
    const candidate = (dayOfWeek + offset) % 7;
    if (targetDays.includes(candidate)) {
      const date = new Date(now);
      date.setDate(date.getDate() + offset);
      return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    }
  }
  return "TBD";
}

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
  const [selectedProduct, setSelectedProduct] = useState<LotteryProduct | null>(null);
  const [step, setStep] = useState<Step>("browse");
  const [quickPick, setQuickPick] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    details: { label: string; value: string }[];
    amount: string;
  } | null>(null);

  const lotteryItems = lotteryProducts.filter((p) => p.type === "lottery");
  const paysafeItems = lotteryProducts.filter((p) => p.type === "paysafe");

  const handleSelect = (product: LotteryProduct) => {
    setSelectedProduct(product);
    if (product.type === "lottery" && !product.id.startsWith("scratch")) {
      setQuickPick(generateQuickPick());
    } else {
      setQuickPick([]);
    }
  };

  const handleDeselect = () => {
    setSelectedProduct(null);
    setQuickPick([]);
  };

  const handlePurchase = () => {
    if (!selectedProduct) return;

    setLoading(true);
    setTimeout(() => {
      addTransaction({
        type: selectedProduct.type === "lottery" ? "lottery" : "paysafe",
        category: "Lottery & Paysafe",
        title: selectedProduct.name,
        description: selectedProduct.description,
        amount: selectedProduct.price,
        currency: "EUR",
      });

      if (selectedProduct.type === "lottery") {
        const isScratch = selectedProduct.id.startsWith("scratch");
        setConfirmationData({
          title: `${selectedProduct.name} Purchased`,
          details: [
            { label: "Product", value: selectedProduct.name },
            { label: "Ticket No.", value: generateTicketNumber() },
            ...(isScratch
              ? [{ label: "Type", value: "Instant Scratch Card" }]
              : [
                  { label: "Draw Date", value: getNextDrawDate(selectedProduct) },
                  { label: "Quick Pick", value: quickPick.join(", ") },
                ]),
          ],
          amount: `\u20AC${selectedProduct.price.toFixed(2)}`,
        });
      } else {
        setConfirmationData({
          title: `${selectedProduct.name} Purchased`,
          details: [
            { label: "Product", value: selectedProduct.name },
            { label: "PIN", value: generatePaysafePin() },
            { label: "Serial", value: generateSerial() },
          ],
          amount: `\u20AC${selectedProduct.price.toFixed(2)}`,
        });
      }

      setLoading(false);
      setStep("done");
    }, 1000);
  };

  const handleRefreshPick = () => {
    setQuickPick(generateQuickPick());
  };

  if (step === "done" && confirmationData) {
    return (
      <PhoneFrame>
        <ConfirmationScreen
          title={confirmationData.title}
          details={confirmationData.details}
          amount={confirmationData.amount}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title="Lottery & Paysafe" showBack={true} />

      <div className="px-4 py-4">
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
              loading={loading}
              onClick={handlePurchase}
            />
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
