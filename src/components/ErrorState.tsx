"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" strokeWidth={2} />
      </div>
      <p className="mb-1 text-base font-semibold text-gray-800">Error</p>
      <p className="mb-5 text-sm text-gray-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.97]"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
