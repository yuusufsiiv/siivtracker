"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Save } from "lucide-react"
import {
  useStore,
  computeScore,
  type WeeklyReview,
} from "@/lib/store"
import {
  addDays,
  fromDateKey,
  toDateKey,
  todayKey,
  diffDays,
  somaliDate,
} from "@/lib/dates"

interface WeekInfo {
  index: number
  startKey: string
  endKey: string
  dayKeys: string[]
  avg: number
  reviewable: boolean
}

export function WeeklyScreen() {
  const { state, setState } = useStore()
  const cfg = state.config
  const start = state.user!.startDate
  const fields = cfg.weeklyFields.filter((f) => f.show)

  const weeks = useMemo<WeekInfo[]>(() => {
    const totalWeeks = Math.ceil(cfg.duration / 7)
    const startDate = fromDateKey(start)
    const out: WeekInfo[] = []
    for (let w = 0; w < totalWeeks; w++) {
      const startKey = toDateKey(addDays(startDate, w * 7))
      const dayKeys: string[] = []
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d
        if (dayNum >= cfg.duration) break
        dayKeys.push(toDateKey(addDays(startDate, dayNum)))
      }
      const endKey = dayKeys[dayKeys.length - 1]
      const scores = dayKeys
        .filter((k) => diffDays(k, todayKey()) >= 0)
        .map((k) => computeScore(state, k).pct)
      const avg =
        scores.length === 0
          ? 0
          : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const reviewable = diffDays(startKey, todayKey()) >= 0
      out.push({ index: w, startKey, endKey, dayKeys, avg, reviewable })
    }
    return out
  }, [state, cfg.duration, start])

  // Default open: latest reviewable week.
  const latestReviewable =
    [...weeks].reverse().find((w) => w.reviewable)?.index ?? 0
  const [open, setOpen] = useState<number>(latestReviewable)

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-10 bg-primary px-5 pb-4 pt-6 text-primary-foreground">
        <h1 className="text-xl font-bold">Dib u eegis Toddobaadle</h1>
        <p className="text-sm text-primary-foreground/70">
          Eeg horumarkaaga toddobaad kasta
        </p>
      </header>

      <div className="space-y-3 px-4 py-4">
        {weeks.map((week) => (
          <WeekCard
            key={week.index}
            week={week}
            fields={fields}
            open={open === week.index}
            onToggle={() =>
              setOpen((cur) => (cur === week.index ? -1 : week.index))
            }
            review={state.weeklyReviews[String(week.index)]}
            onSave={(values) =>
              setState((prev) => ({
                ...prev,
                weeklyReviews: {
                  ...prev.weeklyReviews,
                  [String(week.index)]: {
                    values,
                    savedAt: new Date().toISOString(),
                  },
                },
              }))
            }
          />
        ))}
      </div>
    </div>
  )
}

function WeekCard({
  week,
  fields,
  open,
  onToggle,
  review,
  onSave,
}: {
  week: WeekInfo
  fields: { id: string; label: string }[]
  open: boolean
  onToggle: () => void
  review: WeeklyReview | undefined
  onSave: (values: Record<string, string>) => void
}) {
  const [values, setValues] = useState<Record<string, string>>(
    review?.values ?? {},
  )
  const [saved, setSaved] = useState(false)

  const scoreColor =
    week.avg >= 80
      ? "text-success"
      : week.avg >= 50
        ? "text-gold"
        : "text-danger"

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <div>
          <p className="font-semibold text-card-foreground">
            Toddobaadka {week.index + 1}
          </p>
          <p className="text-xs text-muted-foreground">
            {somaliDate(fromDateKey(week.startKey))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${scoreColor}`}>
            {week.avg}%
          </span>
          {open ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="animate-fade-in border-t border-border px-4 py-4">
          {!week.reviewable ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Toddobaadkan weli ma bilaaban.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((f) => (
                <label key={f.id} className="block">
                  <span className="mb-1 block text-sm font-medium text-card-foreground">
                    {f.label}
                  </span>
                  <textarea
                    value={values[f.id] ?? ""}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [f.id]: e.target.value }))
                      setSaved(false)
                    }}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                    placeholder="Qor halkan..."
                  />
                </label>
              ))}
              <button
                onClick={() => {
                  onSave(values)
                  setSaved(true)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
              >
                <Save className="h-4 w-4" />
                {saved ? "La keydiyey!" : "Keydi"}
              </button>
              {review && (
                <p className="text-center text-xs text-muted-foreground">
                  Markii ugu dambeysay la keydiyey{" "}
                  {new Date(review.savedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
