"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-5 flex items-center justify-center gap-0 px-2">
      {steps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={label} className="flex items-center">
            {/* Step dot */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                      ? "border-2 border-primary bg-white shadow-[0_0_0_3px_rgba(var(--bank-primary-rgb,30,58,95),0.15)]"
                      : "border-2 border-gray-300 bg-white"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isCompleted || isCurrent ? "text-primary" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`mx-1 mb-5 h-0.5 w-6 rounded-full transition-colors duration-300 ${
                  i < currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
