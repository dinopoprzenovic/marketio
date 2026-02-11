"use client";

import { motion } from "framer-motion";

interface LoadingStateProps {
  message?: string;
  /** Number of skeleton rows to show (default: 4) */
  rows?: number;
}

export function LoadingState({ message, rows = 4 }: LoadingStateProps) {
  return (
    <div className="px-0 py-6">
      {message && (
        <p className="mb-4 text-center text-sm text-gray-400">{message}</p>
      )}
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
