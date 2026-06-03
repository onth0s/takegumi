"use client";

import { useId } from "react";

interface ColorControlProps {
  value: string;
  onChange: (value: string) => void;
  onCommit?: () => void;
  presets?: string[];
  label?: string;
  className?: string;
}

export default function ColorControl({
  value,
  onChange,
  onCommit,
  presets,
  label,
  className = "",
}: ColorControlProps) {
  const inputId = useId();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface cursor-pointer hover:border-accent/60 transition-colors duration-150"
      >
        <span
          className="inline-block w-5 h-5 rounded border border-border-default shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs text-text-secondary">{value}</span>
        <input
          id={inputId}
          type="color"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onCommit?.();
          }}
          className="sr-only"
        />
      </label>
      {presets && presets.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset);
                onCommit?.();
              }}
              className={`w-5 h-5 rounded border transition-transform duration-100 hover:scale-110 ${
                preset === value
                  ? "border-accent scale-110 ring-1 ring-accent"
                  : "border-border-default"
              }`}
              style={{ backgroundColor: preset }}
              aria-label={preset}
            />
          ))}
        </div>
      )}
    </div>
  );
}
