"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ScrubInputProps {
  value: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
  min: number;
  max: number;
  step: number;
  fineStep: number;
  suffix?: string;
  label?: string;
  className?: string;
}

export default function ScrubInput({
  value,
  onChange,
  onCommit,
  min,
  max,
  step,
  fineStep,
  suffix = "",
  label,
  className = "",
}: ScrubInputProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(String(value));
  const [displayValue, setDisplayValue] = useState(value);
  const scrubRef = useRef({
    isScrubbing: false,
    startX: 0,
    startValue: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scrubRef.current.isScrubbing && !editing) {
      setDisplayValue(value);
    }
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      scrubRef.current = {
        isScrubbing: false,
        startX: e.clientX,
        startValue: displayValue,
      };
    },
    [displayValue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (scrubRef.current.startX === 0) return;
      const dx = e.clientX - scrubRef.current.startX;
      if (Math.abs(dx) > 3) {
        scrubRef.current.isScrubbing = true;
      }
      if (!scrubRef.current.isScrubbing) return;

      const effectiveStep = e.shiftKey ? fineStep : e.ctrlKey ? step * 10 : step;
      const delta = Math.round(dx / 4) * effectiveStep;
      const next = roundTo(clamp(scrubRef.current.startValue + delta, min, max), 2);
      setDisplayValue(next);
      onChange(next);
    },
    [min, max, step, fineStep, onChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      if (scrubRef.current.isScrubbing) {
        onCommit?.();
      } else {
        setEditText(String(displayValue));
        setEditing(true);
      }
      scrubRef.current = { isScrubbing: false, startX: 0, startValue: 0 };
    },
    [displayValue, onCommit]
  );

  const handleEditBlur = useCallback(() => {
    const parsed = Number(editText);
    if (!isNaN(parsed)) {
      const clamped = clamp(roundTo(parsed, 2), min, max);
      setDisplayValue(clamped);
      onChange(clamped);
      onCommit?.();
    } else {
      setEditText(String(displayValue));
    }
    setEditing(false);
  }, [editText, displayValue, min, max, onChange, onCommit]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLElement).blur();
      } else if (e.key === "Escape") {
        setEditText(String(displayValue));
        setEditing(false);
      }
    },
    [displayValue]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -1;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = 1;
      else return;

      e.preventDefault();
      const effectiveStep = e.shiftKey ? fineStep : e.ctrlKey ? step * 10 : step;
      const next = roundTo(clamp(displayValue + delta * effectiveStep, min, max), 2);
      setDisplayValue(next);
      onChange(next);
    },
    [displayValue, min, max, step, fineStep, onChange]
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
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditBlur}
          onKeyDown={handleEditKeyDown}
          className="w-full px-2 py-1.5 text-sm rounded border border-accent bg-surface text-text-primary outline-none"
        />
      ) : (
        <span
          tabIndex={0}
          role="spinbutton"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={displayValue}
          aria-label={label}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="block w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface text-text-primary cursor-ew-resize touch-none select-none outline-none hover:border-accent/60 focus-visible:border-accent/60"
        >
          {displayValue}
          {suffix && <span className="text-text-tertiary ml-0.5">{suffix}</span>}
        </span>
      )}
    </div>
  );
}
