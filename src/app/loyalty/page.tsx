"use client";

import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { StaggerGrid, StaggerItem, BottomSheet } from "@/components/animations";
import { getLoyaltyCards, saveLoyaltyCard, deleteLoyaltyCard } from "@/lib/store";
import type { LoyaltyCard } from "@/types";

const PRESET_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#22C55E",
  "#8B5CF6",
  "#F97316",
  "#14B8A6",
];

const DEFAULT_CARDS: LoyaltyCard[] = [
  {
    id: "default-konzum",
    storeName: "Konzum",
    cardNumber: "2300 4567 8901 2345",
    color: "#E30613",
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-muller",
    storeName: "Muller",
    cardNumber: "9120 0033 4455 6677",
    color: "#1E3A8A",
    createdAt: new Date().toISOString(),
  },
];

export default function LoyaltyPage() {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ storeName: "", cardNumber: "", color: PRESET_COLORS[0] });

  useEffect(() => {
    let existing = getLoyaltyCards();
    if (existing.length === 0) {
      DEFAULT_CARDS.forEach((card) => saveLoyaltyCard(card));
      existing = getLoyaltyCards();
    }
    setCards(existing);
  }, []);

  const handleSave = () => {
    if (!newCard.storeName.trim() || !newCard.cardNumber.trim()) return;

    const card: LoyaltyCard = {
      id: crypto.randomUUID(),
      storeName: newCard.storeName.trim(),
      cardNumber: newCard.cardNumber.trim(),
      color: newCard.color,
      createdAt: new Date().toISOString(),
    };

    saveLoyaltyCard(card);
    setCards(getLoyaltyCards());
    setNewCard({ storeName: "", cardNumber: "", color: PRESET_COLORS[0] });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    deleteLoyaltyCard(id);
    setCards(getLoyaltyCards());
  };

  return (
    <PhoneFrame>
      <AppHeader title="Loyalty Cards" showBack={true} />

      <div className="px-4 py-4">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <p className="mb-1 text-base font-semibold text-gray-700">No loyalty cards yet</p>
            <p className="mb-5 text-sm text-gray-400">Add your store cards and keep them handy</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.97]"
            >
              Add your first card
            </button>
          </div>
        ) : (
          <StaggerGrid className="flex flex-col gap-4">
            {cards.map((card) => (
              <StaggerItem key={card.id}>
                <div
                  className="relative min-h-[160px] overflow-hidden rounded-2xl p-5 shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}, ${card.color}CC)`,
                  }}
                >
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white/80 transition-colors hover:bg-black/30"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <h3 className="mb-4 text-xl font-bold text-white">{card.storeName}</h3>

                  <p className="mb-4 font-mono text-base tracking-widest text-white/80">
                    {card.cardNumber}
                  </p>

                  <div
                    className="h-[50px] w-full rounded-lg"
                    style={{
                      background: "repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 5px, #fff 5px, #fff 8px, #000 8px, #000 9px, #fff 9px, #fff 11px, #000 11px, #000 14px, #fff 14px, #fff 16px)",
                    }}
                  />
                </div>
              </StaggerItem>
            ))}

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-5 text-sm font-semibold text-gray-400 transition-all hover:border-gray-400 hover:text-gray-500 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Card
            </button>
          </StaggerGrid>
        )}
      </div>

      {/* Add card bottom sheet */}
      <BottomSheet isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <h3 className="mb-4 text-lg font-bold text-gray-900">Add Loyalty Card</h3>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Store name"
            value={newCard.storeName}
            onChange={(e) => setNewCard({ ...newCard, storeName: e.target.value })}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Card number or barcode"
            value={newCard.cardNumber}
            onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />

          <div className="mt-1">
            <p className="mb-2 text-xs font-medium text-gray-500">Card color</p>
            <div className="flex gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewCard({ ...newCard, color })}
                  className="h-9 w-9 rounded-full transition-transform active:scale-90"
                  style={{
                    backgroundColor: color,
                    boxShadow: newCard.color === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!newCard.storeName.trim() || !newCard.cardNumber.trim()}
            className="mt-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-40"
          >
            Save Card
          </button>
        </div>
      </BottomSheet>
    </PhoneFrame>
  );
}
