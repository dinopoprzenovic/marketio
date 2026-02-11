"use client";

import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  label: string;
  price?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export function PurchaseButton({ label, price, disabled = false, loading = false, onClick }: PurchaseButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {price && <span className="rounded-lg bg-white/20 px-2 py-0.5 text-sm">{price}</span>}
        </>
      )}
    </button>
  );
}
