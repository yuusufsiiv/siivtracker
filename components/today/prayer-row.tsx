"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PrayerDef } from "@/lib/defaults"
import type { PrayerTimes } from "@/lib/prayer"
import { nextPrayer, formatCountdown } from "@/lib/prayer"

const PRAYER_TO_TASK: Record<string, string> = {
  fajr: "fajr",
  dhuhr: "dhuhr",
  asr: "casar",
  maghrib: "maghrib",
  isha: "cisho",
}

export function PrayerRow({
  prayers,
  times,
  doneMap,
  now,
  showCountdown,
  showCheck,
}: {
  prayers: PrayerDef[]
  times?: PrayerTimes
  doneMap: Record<string, boolean>
  now: Date
  showCountdown: boolean
  showCheck: boolean
}) {
  const visible = prayers.filter((p) => p.show)
  const order = visible.map((p) => ({
    id: p.id,
    label: p.label,
    time: times?.[p.id] ?? "",
  }))
  const next = times ? nextPrayer(order, now) : null

  return (
    <section aria-label="Salaadaha">
      {showCountdown && next && (
        <p className="mb-2 px-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{next.label}</span>{" "}
          {formatCountdown(next.minutesUntil)}
        </p>
      )}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {visible.map((p) => {
          const isNext = next?.id === p.id
          const time = times?.[p.id]
          const done = showCheck && !!doneMap[PRAYER_TO_TASK[p.id]]
          return (
            <div
              key={p.id}
              className={cn(
                "flex min-w-[88px] flex-col items-center gap-1 rounded-2xl border px-3 py-3",
                isNext
                  ? "border-gold bg-gold-soft"
                  : "border-border bg-card",
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {p.label}
              </span>
              <span className="text-base font-bold tabular-nums text-foreground">
                {time ?? "--:--"}
              </span>
              {done ? (
                <span className="flex h-5 items-center gap-1 text-xs font-medium text-success">
                  <Check className="h-3.5 w-3.5" /> Jamaaco
                </span>
              ) : isNext ? (
                <span className="flex h-5 items-center text-xs font-semibold text-gold">
                  Xiga
                </span>
              ) : (
                <span className="h-5" />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
