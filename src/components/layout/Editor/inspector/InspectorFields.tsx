"use client";

import type { ReactNode } from "react";

export function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{title}</h3>
      {children}
    </section>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      {children}
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
  return (
    <textarea
      {...props}
      className={`w-full px-2 py-1.5 text-sm rounded border border-border-default bg-surface text-text-primary outline-none focus:border-accent/60 resize-y min-h-20 ${props.className ?? ""}`}
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
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

/** Simple toggle (checkbox) styled as a switch. */
export function InspectorToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-border-default transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-accent/50 ${
        checked ? "bg-accent" : "bg-surface"
      }`}
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

export function EmptyInspectorState() {
  return (
    <p className="text-sm text-text-tertiary leading-relaxed">
      Select a panel, text group, or text block on the canvas to edit its properties.
    </p>
  );
}
