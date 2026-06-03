"use client";

import { useCallback, useRef, useState } from "react";

type Position = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: Position;
  delay?: number;
  className?: string;
}

const positionStyles: Record<Position, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 400,
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setVisible(false);
  }, []);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none ${positionStyles[position]}`}
        >
          <div className="px-2 py-1 text-xs text-text-primary bg-surface-elevated border border-border-default rounded shadow-md whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
