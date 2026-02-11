"use client";

import { ReactNode } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Desktop: show phone frame */}
      <div className="hidden min-h-screen items-center justify-center gap-6 bg-[#F0F2F5] p-8 md:flex">
        <div className="relative">
          {/* Phone outer shell */}
          <div className="relative h-[812px] w-[375px] overflow-hidden rounded-[50px] border-[8px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl">
            {/* Notch / Dynamic Island */}
            <div className="absolute top-0 left-1/2 z-50 h-[34px] w-[126px] -translate-x-1/2 rounded-b-[20px] bg-[#1a1a1a]" />

            {/* Status bar area */}
            <div className="absolute top-0 right-0 left-0 z-40 flex h-[54px] items-center justify-between bg-primary px-6">
              <span className="text-xs font-medium text-white/90">9:41</span>
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3 text-white/90" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg className="h-3 w-3 text-white/90" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
              </div>
            </div>

            {/* Content area */}
            <div className="phone-scroll h-full overflow-y-auto bg-gray-50 pt-[54px]">
              {children}
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-[12px] left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white/40" />
        </div>

        {/* Theme switcher panel - outside the phone */}
        <ThemeSwitcher />
      </div>

      {/* Mobile: no frame, just full screen */}
      <div className="block md:hidden">
        <div className="phone-scroll min-h-screen bg-gray-50">
          {children}
        </div>
      </div>
    </>
  );
}
