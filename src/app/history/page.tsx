"use client";

import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { StaggerGrid, StaggerItem } from "@/components/animations";
import { getTransactions } from "@/lib/store";
import type { Transaction } from "@/types";
import {
  Smartphone,
  Gamepad2,
  ShoppingBag,
  Route,
  ParkingSquare,
  Ticket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Telco Top-ups": Smartphone,
  "Gaming Vouchers": Gamepad2,
  "Gift Cards": ShoppingBag,
  "Highway Vignettes": Route,
  "Parking": ParkingSquare,
  "Lottery & Paysafe": Ticket,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Telco Top-ups": "#3B82F6",
  "Gaming Vouchers": "#8B5CF6",
  "Gift Cards": "#EC4899",
  "Highway Vignettes": "#10B981",
  "Parking": "#06B6D4",
  "Lottery & Paysafe": "#F59E0B",
};

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = todayOnly.getTime() - dateOnly.getTime();
  const dayMs = 86400000;

  if (diff < dayMs) return "Today";
  if (diff < dayMs * 2) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const label = formatDateGroup(tx.date);
    const group = groups.get(label) || [];
    group.push(tx);
    groups.set(label, group);
  }
  return groups;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const grouped = groupTransactionsByDate(transactions);

  return (
    <PhoneFrame>
      <AppHeader title="Transaction History" showBack={true} />

      <div className="px-4 py-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p className="mb-1 text-base font-semibold text-gray-700">No transactions yet</p>
            <p className="text-sm text-gray-400">Your purchase history will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from(grouped.entries()).map(([dateLabel, txs]) => (
              <div key={dateLabel}>
                <div className="sticky top-14 z-10 mb-2 bg-gray-50 py-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {dateLabel}
                  </p>
                </div>

                <StaggerGrid className="flex flex-col gap-2">
                  {txs.map((tx) => {
                    const Icon = CATEGORY_ICONS[tx.category] || Smartphone;
                    const color = CATEGORY_COLORS[tx.category] || "#64748B";
                    return (
                      <StaggerItem key={tx.id}>
                        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                          <div
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="h-5 w-5" style={{ color }} strokeWidth={2} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{tx.title}</p>
                            <p className="text-xs text-gray-400">{tx.description || tx.category}</p>
                          </div>

                          <div className="flex flex-shrink-0 flex-col items-end gap-1">
                            <p className="text-sm font-bold text-gray-900">
                              {tx.currency === "EUR" ? "\u20AC" : tx.currency}
                              {tx.amount.toFixed(2)}
                            </p>
                            {tx.status === "completed" && (
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-medium text-emerald-600">Completed</span>
                              </div>
                            )}
                            {tx.status === "pending" && (
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-medium text-amber-600">Pending</span>
                              </div>
                            )}
                            {tx.status === "failed" && (
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                <span className="text-[10px] font-medium text-red-600">Failed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerGrid>
              </div>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
