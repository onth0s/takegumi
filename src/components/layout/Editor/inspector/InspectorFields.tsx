"use client";

import { useState, useRef, useLayoutEffect, type ReactNode } from "react";
import { useId, cloneElement, isValidElement } from "react";
import ToggleSwitch from "@/components/shared/UI/ToggleSwitch";

export function InspectorSection({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-tertiary w-full text-left"
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10"
          className={`shrink-0 transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
        >
          <path d="M3 2 L7 5 L3 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </button>
      {open && children}
    </section>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      {isValidElement(children) ? cloneElement(children as React.ReactElement<{ id?: string }>, { id }) : children}
    </label>
  );
}

export function InspectorInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface text-text-primary outline-none focus:border-accent/60 ${props.className ?? ""}`}
    />
  );
}

export function InspectorTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);

  return (
    <textarea
      ref={ref}
      {...props}
      className={`w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface text-text-primary outline-none focus:border-accent/60 resize-none overflow-hidden ${props.className ?? ""}`}
    />
  );
}

export function InspectorSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface text-text-primary outline-none focus:border-accent/60 ${props.className ?? ""}`}
    />
  );
}

export function InspectorButton({
  variant = "default",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "danger" }) {
  const base =
    "w-full px-3 py-1.5 text-sm rounded border transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "danger"
      ? "border-danger/40 text-danger hover:bg-danger/10"
      : "border-border-default text-text-secondary hover:border-accent/50 hover:text-accent";

  return (
    <button type="button" {...props} className={`${base} ${styles} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

/** Horizontal row — label on left, control on right. */
export function FieldRowHorizontal({ label, children }: { label: string; children: ReactNode }) {
  const labelId = useId();
  return (
    <label className="flex items-center justify-between gap-3">
      <span id={labelId} className="text-xs text-text-secondary">{label}</span>
      {isValidElement(children)
        ? cloneElement(children as React.ReactElement<{ "aria-labelledby"?: string }>, { "aria-labelledby": labelId })
        : children}
    </label>
  );
}

export function AlignmentControl({
  value,
  onChange,
}: {
  value: "left" | "center" | "right";
  onChange: (value: "left" | "center" | "right") => void;
}) {
  const options = [
    { value: "left" as const, label: "Left" },
    { value: "center" as const, label: "Center" },
    { value: "right" as const, label: "Right" },
  ];
  return (
    <div className="flex rounded-md overflow-hidden border border-border-subtle">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-2 py-1 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-accent text-white"
              : "bg-surface text-text-secondary hover:bg-surface-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs text-text-secondary">{children}</span>;
}

export { ToggleSwitch as InspectorToggle };

export function EmptyInspectorState() {
  return (
    <p className="text-sm text-text-tertiary leading-relaxed">
      Select a panel, text group, or text block on the canvas to edit its properties.
    </p>
  );
}
