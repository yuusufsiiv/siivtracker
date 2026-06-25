"use client"

import { BarChart3, CalendarCheck, Grid3x3, LineChart } from "lucide-react"
import { cn } from "@/lib/utils"

export type Screen = "today" | "grid" | "weekly" | "stats" | "settings"

const TABS: { id: Screen; label: string; Icon: typeof CalendarCheck }[] = [
  { id: "today", label: "Maanta", Icon: CalendarCheck },
  { id: "grid", label: "Jadwal", Icon: Grid3x3 },
  { id: "weekly", label: "Toddobaad", Icon: LineChart },
  { id: "stats", label: "Xogta", Icon: BarChart3 },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Screen
  onChange: (s: Screen) => void
}) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "stroke-[2.5]")}
                aria-hidden
              />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
