"use client";

import { motion, AnimatePresence } from "motion/react";

interface ToastProps {
  message: string | null;
  type?: "info" | "error" | "success";
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  if (!message) return null;

  const bgStyle =
    type === "error"
      ? "bg-danger/90 border-danger text-white"
      : type === "success"
      ? "bg-success/90 border-success text-white"
      : "bg-surface-elevated border-accent/60 text-text-primary";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`fixed bottom-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-xl text-xs font-medium flex items-center gap-3 backdrop-blur-md ${bgStyle}`}
      >
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity ml-1"
          >
            ✕
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
