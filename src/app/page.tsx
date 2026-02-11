"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { MarketioLogo } from "@/components/MarketioLogo";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/animations";
import { serviceCategories } from "@/data/services";

export default function HomePage() {
  return (
    <PhoneFrame>
      <AppHeader title="Marketplace" showBack={false} />

      <div className="px-4 pb-6 pt-4">
        {/* Welcome banner */}
        <FadeIn>
          <div
            className="relative mb-5 overflow-hidden rounded-2xl px-5 py-5 shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--bank-primary), var(--bank-accent))" }}
          >
            {/* Pattern overlay */}
            <svg
              className="absolute inset-0 h-full w-full opacity-[0.07]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
            <div className="relative">
              <div className="mb-2">
                <MarketioLogo variant="light" size="md" />
              </div>
              <p className="text-sm text-white/70">Your banking marketplace</p>
            </div>
          </div>
        </FadeIn>

        {/* Service grid */}
        <StaggerGrid className="grid grid-cols-2 gap-3">
          {serviceCategories.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </PhoneFrame>
  );
}
