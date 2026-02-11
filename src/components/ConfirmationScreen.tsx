"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedCheckmark } from "./animations";

interface ConfirmationScreenProps {
  title: string;
  details: { label: string; value: string }[];
  amount: string;
  onDone?: () => void;
}

export function ConfirmationScreen({ title, details, amount, onDone }: ConfirmationScreenProps) {
  const router = useRouter();

  const handleDone = () => {
    if (onDone) onDone();
    else router.push("/");
  };

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col items-center justify-center px-6 py-10">
      <AnimatedCheckmark />

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mb-1 text-xl font-bold text-gray-900"
      >
        Purchase Successful
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="mb-6 text-sm text-gray-500"
      >
        {title}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.35 }}
        className="mb-8 w-full max-w-sm rounded-2xl bg-white p-5 shadow-sm"
      >
        {details.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.07, duration: 0.25 }}
            className={`flex items-center justify-between py-3 ${
              i < details.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <span className="text-sm text-gray-500">{d.label}</span>
            <span className="text-sm font-medium text-gray-800">{d.value}</span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 + details.length * 0.07 + 0.1, duration: 0.3 }}
          className="mt-3 flex items-center justify-between border-t-2 border-dashed border-gray-200 pt-3"
        >
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-lg font-bold text-primary">{amount}</span>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        onClick={handleDone}
        className="w-full max-w-sm rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
      >
        Back to Marketplace
      </motion.button>
    </div>
  );
}
