"use client"

import { useStore, computeScore } from "@/lib/store"
import {
  SOMALI_DAYS_SHORT,
  fromDateKey,
  toDateKey,
  addDays,
  todayKey,
  diffDays,
} from "@/lib/dates"
import { cn } from "@/lib/utils"

function colorForDay(opts: {
  isFuture: boolean
  isPast: boolean
  pct: number
  hasData: boolean
}): string {
  if (opts.isFuture) return "bg-muted"
  if (!opts.hasData || opts.pct === 0) {
    return opts.isPast ? "bg-danger/70" : "bg-muted"
  }
  if (opts.pct < 50) return "bg-primary/30"
  if (opts.pct < 80) return "bg-primary/60"
  return "bg-primary"
}

export function CalendarScreen({
  onOpenDay,
}: {
  onOpenDay: (key: string) => void
}) {
  const { state } = useStore()
  const start = state.user?.startDate ?? todayKey()
  const startDate = fromDateKey(start)
  const duration = state.config.duration
  const today = todayKey()

  // Build day cells with weekday alignment.
  const leadingBlanks = startDate.getDay()
  const cells: ({ key: string; dayNum: number } | null)[] = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let i = 0; i < duration; i++) {
    const d = addDays(startDate, i)
    cells.push({ key: toDateKey(d), dayNum: i + 1 })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <h1 className="text-xl font-bold">Jadwalka {duration} Maalmood</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">
          Taabo maalin hore si aad u eegto.
        </p>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 py-5">
        {/* Phase banners */}
        <div className="space-y-2">
          <PhaseBanner phase={1} tone="bg-primary/20 text-primary" />
          <PhaseBanner phase={2} tone="bg-primary/50 text-primary-foreground" />
          <PhaseBanner phase={3} tone="bg-primary text-primary-foreground" />
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold text-muted-foreground">
          {SOMALI_DAYS_SHORT.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell) return <span key={`b${i}`} />
            const fromToday = diffDays(today, cell.key)
            const isFuture = fromToday > 0
            const isPast = fromToday < 0
            const isCurrent = cell.key === today
            const hasData = !!state.days[cell.key]
            const score = computeScore(state, cell.key)
            const color = colorForDay({
              isFuture,
              isPast,
              pct: score.pct,
              hasData,
            })
            return (
              <button
                key={cell.key}
                type="button"
                disabled={isFuture}
                onClick={() => onOpenDay(cell.key)}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold transition-transform active:scale-95",
                  color,
                  color === "bg-muted"
                    ? "text-muted-foreground"
                    : color === "bg-primary/30"
                      ? "text-primary"
                      : "text-primary-foreground",
                  isCurrent && "ring-2 ring-gold ring-offset-1 ring-offset-background",
                )}
                aria-label={`Maalinta ${cell.dayNum}`}
              >
                {cell.dayNum}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
          <Legend className="bg-danger/70" label="La seegay" />
          <Legend className="bg-primary/30" label="1-49%" />
          <Legend className="bg-primary/60" label="50-79%" />
          <Legend className="bg-primary" label="80-100%" />
          <Legend className="bg-muted" label="Mustaqbal" />
        </div>
      </main>
    </div>
  )
}

function PhaseBanner({
  phase,
  tone,
}: {
  phase: 1 | 2 | 3
  tone: string
}) {
  const labels: Record<number, string> = {
    1: "Days 1-30 — Dhisidda Caadooyinka",
    2: "Days 31-60 — Xoojinta Nidaamka",
    3: "Days 61-90 — Nolosha Cusub",
  }
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-2 text-xs font-semibold",
        tone,
      )}
    >
      {labels[phase]}
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded", className)} />
      {label}
    </span>
  )
}
