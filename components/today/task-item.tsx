"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function TaskItem({
  label,
  checked,
  onToggle,
  disabled,
  accent = "primary",
  trailing,
  onLongPress,
}: {
  label: string
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  accent?: "primary" | "gold"
  trailing?: React.ReactNode
  onLongPress?: () => void
}) {
  let pressTimer: ReturnType<typeof setTimeout> | null = null
  function startPress() {
    if (!onLongPress) return
    pressTimer = setTimeout(onLongPress, 500)
  }
  function endPress() {
    if (pressTimer) clearTimeout(pressTimer)
  }

  const onColor = accent === "gold" ? "bg-gold border-gold" : "bg-primary border-primary"

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors",
        checked && "border-primary/30 bg-primary/5",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        className="flex flex-1 items-center gap-3 text-left"
        aria-pressed={checked}
      >
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            checked ? onColor : "border-border bg-background",
          )}
        >
          {checked && <Check className="h-4 w-4 text-primary-foreground" />}
        </span>
        <span
          className={cn(
            "text-sm font-medium text-foreground",
            checked && "text-muted-foreground line-through",
          )}
        >
          {label}
        </span>
      </button>
      {trailing}
    </div>
  )
}
