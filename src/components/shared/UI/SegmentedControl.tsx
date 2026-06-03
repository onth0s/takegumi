"use client";

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  label,
  className = "",
}: SegmentedControlProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <div
        className="flex rounded border border-border-default overflow-hidden"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors duration-100 ${
              value === opt.value
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
