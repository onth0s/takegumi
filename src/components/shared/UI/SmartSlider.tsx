"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

interface SmartSliderProps {
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

export default function SmartSlider({
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
}: SmartSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!dragging.current) {
      setLocalValue(value);
    }
  }, [value]);

  const ratio = (localValue - min) / (max - min);

  const computeValue = useCallback(
    (clientX: number, shift: boolean, ctrl: boolean) => {
      const track = trackRef.current;
      if (!track) return localValue;
      const rect = track.getBoundingClientRect();
      const rawRatio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + rawRatio * (max - min);

      let snapped: number;
      if (ctrl && ctrlSteps?.length) {
        snapped = snapToSteps(rawValue, ctrlSteps);
      } else {
        const effectiveStep = shift ? fineStep : step;
        snapped = Math.round(rawValue / effectiveStep) * effectiveStep;
      }

      return roundTo(clamp(snapped, min, max), 2);
    },
    [min, max, step, fineStep, ctrlSteps, localValue]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const v = computeValue(e.clientX, e.shiftKey, e.ctrlKey);
      setLocalValue(v);
      onChange(v);
    },
    [computeValue, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const v = computeValue(e.clientX, e.shiftKey, e.ctrlKey);
      setLocalValue(v);
      onChange(v);
    },
    [computeValue, onChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      const v = computeValue(e.clientX, e.shiftKey, e.ctrlKey);
      setLocalValue(v);
      onChange(v);
      onCommit?.();
    },
    [computeValue, onChange, onCommit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -1;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = 1;
      else return;

      e.preventDefault();

      let next: number;
      if (e.ctrlKey && ctrlSteps?.length) {
        const dir = delta > 0 ? 1 : -1;
        const sorted = [...ctrlSteps].sort((a, b) => a - b);
        const nearest = sorted.reduce((prev, curr) =>
          Math.abs(curr - localValue) < Math.abs(prev - localValue) ? curr : prev
        );
        const idx = sorted.indexOf(nearest);
        const nextIdx = clamp(idx + dir, 0, sorted.length - 1);
        next = sorted[nextIdx];
      } else {
        const effectiveStep = e.shiftKey ? fineStep : step;
        next = localValue + delta * effectiveStep;
      }

      const clamped = roundTo(clamp(next, min, max), 2);
      setLocalValue(clamped);
      onChange(clamped);
    },
    [localValue, min, max, step, fineStep, ctrlSteps, onChange]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) onCommit?.();
    },
    [onCommit]
  );



  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={localValue}
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className="relative h-5 w-full cursor-pointer touch-none select-none outline-none"
      >
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-border-default" />
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ width: `${ratio * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent border-2 border-surface shadow-sm"
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
