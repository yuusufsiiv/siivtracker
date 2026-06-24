"use client"

import { cn } from "@/lib/utils"

export function ScoreBar({
  label,
  done,
  total,
  pct,
}: {
  label: string
  done: number
  total: number
  pct: number
}) {
  const high = pct >= 80
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span
          className={cn(
            "text-lg font-bold tabular-nums",
            high ? "text-gold" : "text-primary",
          )}
        >
          {done}/{total}
        </span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            high ? "bg-gold" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && total > 0 && (
        <p className="mt-3 text-sm font-medium text-gold">
          Mahadsanid! Maalin buuxda aad u qabatay
        </p>
      )}
    </div>
  )
}
