"use client"

import { cn } from "@/lib/utils"

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  accent = "primary",
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  accent?: "primary" | "gold" | "success"
  label?: string
}) {
  const onColor =
    accent === "gold"
      ? "bg-gold"
      : accent === "success"
        ? "bg-success"
        : "bg-primary"
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-40",
        checked ? onColor : "bg-border",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  )
}
