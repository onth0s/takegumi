"use client";

import { useCallback } from "react";

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snapToSteps(value: number, steps: number[]): number {
  return steps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

interface SmartNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
  min: number;
  max: number;
  step: number;
  fineStep: number;
  ctrlSteps?: number[];
  label?: string;
  className?: string;
}

export default function SmartNumberInput({
  value,
  onChange,
  onCommit,
  min,
  max,
  step,
  fineStep,
  ctrlSteps,
  label,
  className = "",
}: SmartNumberInputProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      let delta = 0;
      if (e.key === "ArrowDown") delta = -1;
      else if (e.key === "ArrowUp") delta = 1;
      else return;

      e.preventDefault();

      let next: number;
      if (e.ctrlKey && ctrlSteps?.length) {
        const dir = delta > 0 ? 1 : -1;
        const sorted = [...ctrlSteps].sort((a, b) => a - b);
        const idx = sorted.indexOf(Number(e.currentTarget.value));
        const nextIdx = clamp(idx + dir, 0, sorted.length - 1);
        next = sorted[nextIdx];
      } else {
        const effectiveStep = e.shiftKey ? fineStep : step;
        next = Number(e.currentTarget.value) + delta * effectiveStep;
      }

      const clamped = roundTo(clamp(next, min, max), 2);
      onChange(clamped);
    },
    [min, max, step, fineStep, ctrlSteps, onChange]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key.startsWith("Arrow")) onCommit?.();
    },
    [onCommit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(e.target.value);
      if (!isNaN(parsed)) {
        onChange(clamp(roundTo(parsed, 2), min, max));
      }
    },
    [min, max, onChange]
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={() => onCommit?.()}
        min={min}
        max={max}
        step={step}
        className="w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface text-text-primary outline-none focus:border-accent/60"
      />
    </div>
  );
}
