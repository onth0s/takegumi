"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  "aria-labelledby": ariaLabelledby,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={ariaLabelledby}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-border-default transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-accent/50 ${
        checked ? "bg-accent" : "bg-surface"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-150 ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
        style={{ marginTop: "1.5px" }}
      />
    </button>
  );
}
