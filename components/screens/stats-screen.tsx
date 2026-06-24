"use client"

import { useMemo } from "react"
import { useStore, computeScore, getDay } from "@/lib/store"
import {
  todayKey,
  fromDateKey,
  toDateKey,
  addDays,
  diffDays,
  dayNumber,
} from "@/lib/dates"
import {
  Flame,
  Trophy,
  CalendarCheck,
  Cigarette,
  TrendingUp,
  Settings,
} from "lucide-react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function StatsScreen({
  onOpenSettings,
}: {
  onOpenSettings?: () => void
}) {
  const { state } = useStore()
  const cfg = state.config
  const startKey = state.user?.startDate ?? todayKey()
  const today = todayKey()

  const stats = useMemo(() => {
    const elapsed = Math.min(
      Math.max(diffDays(startKey, today) + 1, 0),
      cfg.duration,
    )
    const keys: string[] = []
    for (let i = 0; i < elapsed; i++) {
      keys.push(toDateKey(addDays(fromDateKey(startKey), i)))
    }

    const scores = keys.map((k) => computeScore(state, k).pct)
    const perfectDays = scores.filter((s) => s === 100).length
    const avg =
      scores.length === 0
        ? 0
        : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    // Current streak: consecutive days (ending today) with score >= 1
    let streak = 0
    for (let i = keys.length - 1; i >= 0; i--) {
      if (scores[i] > 0) streak++
      else break
    }
    // Best streak
    let best = 0
    let run = 0
    for (const s of scores) {
      if (s > 0) {
        run++
        best = Math.max(best, run)
      } else run = 0
    }

    // Siiga-free days
    const siigaFree = keys.filter((k) => getDay(state, k).siiga).length
    let siigaStreak = 0
    for (let i = keys.length - 1; i >= 0; i--) {
      if (getDay(state, keys[i]).siiga) siigaStreak++
      else break
    }

    // Per-task completion rate
    const taskRates = cfg.tasks
      .filter((t) => t.enabled)
      .map((t) => {
        const done = keys.filter((k) => getDay(state, k).tasks[t.id]).length
        return {
          id: t.id,
          name: t.name,
          rate: keys.length ? Math.round((done / keys.length) * 100) : 0,
        }
      })
      .sort((a, b) => b.rate - a.rate)

    return {
      elapsed,
      avg,
      perfectDays,
      streak,
      best,
      siigaFree,
      siigaStreak,
      taskRates,
      scores,
      keys,
    }
  }, [state, cfg, startKey, today])

  const dayNum = dayNumber(startKey, today)

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tirakoob</h1>
          <p className="text-sm text-muted-foreground">
            Maalin {Math.min(dayNum, cfg.duration)} / {cfg.duration}
          </p>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            aria-label="Dejinta"
            className="rounded-full border border-border bg-card p-2 text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Streak hadda"
          value={`${stats.streak}`}
          sub="maalmood isku xiga"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Streak ugu fiican"
          value={`${stats.best}`}
          sub="maalmood"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Celcelis guud"
          value={`${stats.avg}%`}
        />
        <StatCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Maalmo 100%"
          value={`${stats.perfectDays}`}
        />
      </div>

      {cfg.siiga.show && (
        <div className="mb-5 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-soft text-gold">
            <Cigarette className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {cfg.siiga.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.siigaFree} maalmood guud · {stats.siigaStreak} isku xiga
            </p>
          </div>
        </div>
      )}

      {/* Progress trend */}
      <section className="mb-5 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Horumarka {stats.elapsed} maalmood
        </h2>
        <div className="flex h-28 items-end gap-px overflow-hidden">
          {stats.scores.map((s, i) => (
            <div
              key={i}
              title={`Maalin ${i + 1}: ${s}%`}
              className="flex-1 rounded-t-sm bg-primary"
              style={{ height: `${Math.max(s, 2)}%`, opacity: s === 0 ? 0.2 : 1 }}
            />
          ))}
          {stats.scores.length === 0 && (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">
              Weli ma jiro xog.
            </p>
          )}
        </div>
      </section>

      {/* Task breakdown */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Heerka dhammaystirka hawl kasta
        </h2>
        <div className="space-y-3">
          {stats.taskRates.map((t) => (
            <div key={t.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-foreground">{t.name}</span>
                <span className="font-semibold text-muted-foreground">
                  {t.rate}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${t.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
