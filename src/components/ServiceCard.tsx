"use client";

import Link from "next/link";
import { ServiceCategory } from "@/types";
import {
  Smartphone,
  Gamepad2,
  ShoppingBag,
  Route,
  ParkingSquare,
  Ticket,
  CreditCard,
  Receipt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Gamepad2,
  ShoppingBag,
  Route,
  ParkingSquare,
  Ticket,
  CreditCard,
  Receipt,
};

export function ServiceCard({ service }: { service: ServiceCategory }) {
  const Icon = iconMap[service.icon];

  return (
    <Link
      href={service.href}
      className="flex h-full flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${service.color}15` }}
      >
        {Icon ? (
          <Icon className="h-6 w-6" style={{ color: service.color }} strokeWidth={2} />
        ) : (
          <span className="text-2xl">{service.icon}</span>
        )}
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-gray-800">{service.name}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-gray-400">{service.description}</p>
      </div>
    </Link>
  );
}
