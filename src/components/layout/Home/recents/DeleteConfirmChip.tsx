"use client";

import { motion } from "motion/react";

interface Props {
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  className?: string;
}

export default function DeleteConfirmChip({ onConfirm, onCancel, className = "" }: Props) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute h-5 w-10 flex items-center bg-surface-elevated border border-border-default rounded-full shadow-lg overflow-hidden z-20 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onConfirm}
        className="w-5 h-full flex items-center justify-center hover:bg-success/15 transition-colors cursor-pointer"
        title="Confirm delete"
      >
        <img src="/SVG/confirm_tick.svg" className="w-3 h-3" alt="✓" />
      </button>
      <button
        onClick={onCancel}
        className="w-5 h-full flex items-center justify-center hover:bg-surface-hover transition-colors cursor-pointer"
        title="Cancel"
      >
        <img src="/SVG/confirm_cancel.svg" className="w-2.5 h-2.5" alt="✗" />
      </button>
    </motion.div>
  );
}
