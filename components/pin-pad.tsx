"use client"

import { Delete } from "lucide-react"
import { cn } from "@/lib/utils"

export function PinPad({
  value,
  onChange,
  shake,
  disabled,
  accentDots = "primary",
}: {
  value: string
  onChange: (next: string) => void
  shake?: boolean
  disabled?: boolean
  accentDots?: "primary" | "light"
}) {
  function press(digit: string) {
    if (disabled) return
    if (value.length >= 4) return
    onChange(value + digit)
  }
  function del() {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

  const filledColor =
    accentDots === "light" ? "bg-primary-foreground" : "bg-primary"
  const emptyBorder =
    accentDots === "light" ? "border-primary-foreground/40" : "border-border"

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className={cn("flex items-center gap-5", shake && "animate-shake")}
        aria-label={`${value.length} of 4 digits entered`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-colors",
              i < value.length
                ? `${filledColor} border-transparent`
                : `bg-transparent ${emptyBorder}`,
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => press(k)}
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full border text-2xl font-semibold transition-active active:scale-95",
              accentDots === "light"
                ? "border-primary-foreground/40 text-primary-foreground active:bg-primary-foreground/10"
                : "border-border text-foreground active:bg-muted",
              "disabled:opacity-40",
            )}
          >
            {k}
          </button>
        ))}
        <span />
        <button
          type="button"
          disabled={disabled}
          onClick={() => press("0")}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border text-2xl font-semibold active:scale-95",
            accentDots === "light"
              ? "border-primary-foreground/40 text-primary-foreground active:bg-primary-foreground/10"
              : "border-border text-foreground active:bg-muted",
            "disabled:opacity-40",
          )}
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={del}
          aria-label="Delete"
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full active:scale-95 disabled:opacity-30",
            accentDots === "light"
              ? "text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
