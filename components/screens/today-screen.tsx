"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Info, Pencil, Plus, Trash2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { TaskItem } from "@/components/today/task-item"
import { ScoreBar } from "@/components/today/score-bar"
import { PrayerRow } from "@/components/today/prayer-row"
import { SiigaCard } from "@/components/today/siiga-card"
import { AddCustomTask } from "@/components/today/add-custom-task"
import { BottomSheet, ConfirmDialog } from "@/components/ui/sheet"
import {
  useStore,
  getDay,
  emptyDay,
  computeScore,
  customTasksForDate,
  isCustomDone,
  type CustomTask,
  type Frequency,
} from "@/lib/store"
import {
  dayNumber,
  phaseForDay,
  somaliDate,
  formatClock,
  fromDateKey,
  todayKey,
  isFutureKey,
  isPastKey,
} from "@/lib/dates"
import { fetchPrayerTimes } from "@/lib/prayer"
import { useNow } from "@/lib/use-now"

const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1 — Dhisidda Caadooyinka",
  2: "Phase 2 — Xoojinta Nidaamka",
  3: "Phase 3 — Nolosha Cusub",
}

export function TodayScreen({
  dateKey,
  onBack,
}: {
  dateKey?: string
  onBack?: () => void
}) {
  const { state, setState } = useStore()
  const now = useNow(20000)
  const key = dateKey ?? todayKey()
  const isToday = key === todayKey()
  const readOnly = isPastKey(key) || isFutureKey(key)
  const future = isFutureKey(key)

  const [showRules, setShowRules] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<CustomTask | null>(null)
  const [actionTask, setActionTask] = useState<CustomTask | null>(null)
  const [deleteTask, setDeleteTask] = useState<CustomTask | null>(null)

  const cfg = state.config
  const day = getDay(state, key)
  const date = fromDateKey(key)
  const startKey = state.user?.startDate ?? todayKey()
  const dayNum = dayNumber(startKey, key)
  const phase = phaseForDay(dayNum)
  const score = computeScore(state, key)
  const fetched = useRef(false)
  const notified = useRef<Set<string>>(new Set())

  // Fetch prayer times for the viewed day.
  useEffect(() => {
    if (fetched.current) return
    if (day.prayerTimes) {
      fetched.current = true
      return
    }
    const user = state.user
    if (!user) return
    if (user.lat == null && !user.city) return
    fetched.current = true
    fetchPrayerTimes({
      date,
      lat: user.lat,
      lng: user.lng,
      city: user.city,
      method: user.calcMethod,
    }).then((times) => {
      if (times) {
        setState((prev) => {
          const d = prev.days[key] ?? emptyDay()
          return {
            ...prev,
            days: { ...prev.days, [key]: { ...d, prayerTimes: times } },
          }
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Lightweight in-app prayer notifications (while app open).
  useEffect(() => {
    if (!isToday || !day.prayerTimes) return
    if (typeof Notification === "undefined") return
    if (Notification.permission !== "granted") return
    const nowMin = now.getHours() * 60 + now.getMinutes()
    for (const p of cfg.prayers) {
      if (!p.notify || !state.user?.notifications[p.id]) continue
      const t = day.prayerTimes[p.id]
      if (!t) continue
      const [h, m] = t.split(":").map(Number)
      const pm = h * 60 + m
      if (nowMin === pm && !notified.current.has(p.id)) {
        notified.current.add(p.id)
        try {
          new Notification(`Waqtiga Salaadda — ${p.label}`, {
            body: `${p.label} waqtigeedi waa yimid. Kac oo salaado!`,
          })
        } catch {
          /* ignore */
        }
      }
    }
  }, [now, day.prayerTimes, isToday, cfg.prayers, state.user])

  function toggleTask(taskId: string) {
    if (readOnly) return
    setState((prev) => {
      const d = prev.days[key] ?? emptyDay()
      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: { ...d, tasks: { ...d.tasks, [taskId]: !d.tasks[taskId] } },
        },
      }
    })
  }

  function setSiiga(next: { siiga: boolean; why: string; prevention: string }) {
    if (readOnly) return
    setState((prev) => {
      const d = prev.days[key] ?? emptyDay()
      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: {
            ...d,
            siiga: next.siiga,
            sigayWhy: next.why,
            sigayPrevention: next.prevention,
          },
        },
      }
    })
  }

  function toggleCustom(taskId: string) {
    if (readOnly) return
    setState((prev) => {
      const log = prev.customTaskLogs[key] ?? {}
      return {
        ...prev,
        customTaskLogs: {
          ...prev.customTaskLogs,
          [key]: { ...log, [taskId]: !log[taskId] },
        },
      }
    })
  }

  function saveCustomTask(data: {
    name: string
    frequency: Frequency
    scheduledDays: number[]
  }) {
    setState((prev) => {
      if (editTask) {
        return {
          ...prev,
          customTasks: {
            ...prev.customTasks,
            [editTask.id]: {
              ...prev.customTasks[editTask.id],
              name: data.name,
              frequency: data.frequency,
              scheduledDays: data.scheduledDays,
            },
          },
        }
      }
      const id = `ct_${Date.now()}`
      const task: CustomTask = {
        id,
        name: data.name,
        frequency: data.frequency,
        scheduledDays: data.scheduledDays,
        colorTag: "#4a6fa5",
        createdAt: new Date().toISOString(),
        active: true,
        deletedAt: null,
      }
      return { ...prev, customTasks: { ...prev.customTasks, [id]: task } }
    })
    setEditTask(null)
  }

  function confirmDelete() {
    if (!deleteTask) return
    setState((prev) => ({
      ...prev,
      customTasks: {
        ...prev.customTasks,
        [deleteTask.id]: {
          ...prev.customTasks[deleteTask.id],
          active: false,
          deletedAt: new Date().toISOString(),
        },
      },
    }))
    setDeleteTask(null)
  }

  const enabledSections = cfg.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
  const customTasks = customTasksForDate(state, date)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 active:scale-95"
                aria-label="Dib u noqo"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <Logo size={32} />
            )}
            <span className="text-base font-bold">{cfg.appTitle}</span>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold tabular-nums">
              {formatClock(now)}
            </span>
            {cfg.showRules && (
              <button
                type="button"
                onClick={() => setShowRules(true)}
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary-foreground/70"
              >
                <Info className="h-3.5 w-3.5" /> Xeerar
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-primary-foreground/70">
          {somaliDate(date)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
            Maalinta {dayNum} / {cfg.duration}
          </span>
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
            Phase {phase}
          </span>
          {readOnly && (
            <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
              {future ? "La xidhay" : "Hore"}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-5 px-4 py-5">
        {future ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Maalintan weli ma timaado. Kuma calaamadi kartid hawlaha
            mustaqbalka.
          </div>
        ) : (
          <>
            {/* Prayer times */}
            {cfg.showPrayerRow && (
              <PrayerRow
                prayers={cfg.prayers}
                times={day.prayerTimes}
                doneMap={day.tasks}
                now={now}
                showCountdown={cfg.showCountdown && isToday}
                showCheck
              />
            )}
            {cfg.showPrayerRow &&
              !day.prayerTimes &&
              state.user?.lat == null &&
              !state.user?.city && (
                <p className="px-1 text-xs text-muted-foreground">
                  Geli goobtaada Settings si aad u hesho waqtiyada salaadda.
                </p>
              )}

            {/* Score */}
            {cfg.showScore && (
              <ScoreBar
                label={cfg.scoreLabel}
                done={score.done}
                total={score.total}
                pct={score.pct}
              />
            )}

            {/* Task sections */}
            {enabledSections.map((section) => {
              const tasks = cfg.tasks
                .filter((t) => t.enabled && t.section === section.id)
                .sort((a, b) => a.order - b.order)
              if (tasks.length === 0) return null
              return (
                <section key={section.id}>
                  <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {section.name}
                  </h2>
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <TaskItem
                        key={t.id}
                        label={t.name}
                        checked={!!day.tasks[t.id]}
                        onToggle={() => toggleTask(t.id)}
                        disabled={readOnly}
                      />
                    ))}
                  </div>
                </section>
              )
            })}

            {/* Siiga tracker */}
            {cfg.siiga.show && (
              <SiigaCard
                config={cfg.siiga}
                siiga={day.siiga}
                why={day.sigayWhy}
                prevention={day.sigayPrevention}
                readOnly={readOnly}
                onChange={setSiiga}
              />
            )}

            {/* Custom tasks */}
            <section>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Hawlahaaga Gaar ah
              </h2>
              <div className="space-y-2">
                {customTasks.map((ct) => (
                  <TaskItem
                    key={ct.id}
                    label={ct.name}
                    checked={isCustomDone(state, key, ct.id)}
                    onToggle={() => toggleCustom(ct.id)}
                    disabled={readOnly}
                    onLongPress={
                      readOnly ? undefined : () => setActionTask(ct)
                    }
                    trailing={
                      !readOnly ? (
                        <button
                          type="button"
                          onClick={() => setActionTask(ct)}
                          className="text-muted-foreground active:text-foreground"
                          aria-label="Doorashooyin"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      ) : undefined
                    }
                  />
                ))}
                {customTasks.length === 0 && (
                  <p className="px-1 text-xs text-muted-foreground">
                    Wax hawlo gaar ah lama qorsheynin maanta.
                  </p>
                )}
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setEditTask(null)
                    setAddOpen(true)
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm font-semibold text-primary active:bg-primary/5"
                >
                  <Plus className="h-4 w-4" /> Ku dar Hawl Cusub
                </button>
              )}
            </section>

            {/* Quote */}
            {cfg.showQuote && (
              <p className="text-balance px-2 py-4 text-center text-sm italic text-muted-foreground">
                &ldquo;{cfg.quote}&rdquo;
              </p>
            )}
          </>
        )}
      </main>

      {/* Rules sheet */}
      <BottomSheet
        open={showRules}
        onClose={() => setShowRules(false)}
        title="Xeerarka"
      >
        <ul className="space-y-3">
          {cfg.rules.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-card p-3 text-sm text-foreground"
            >
              {r.text}
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* Custom task add/edit */}
      <AddCustomTask
        open={addOpen}
        existing={editTask}
        onClose={() => {
          setAddOpen(false)
          setEditTask(null)
        }}
        onSave={saveCustomTask}
      />

      {/* Custom task actions */}
      <BottomSheet
        open={!!actionTask}
        onClose={() => setActionTask(null)}
        title={actionTask?.name}
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setEditTask(actionTask)
              setActionTask(null)
              setAddOpen(true)
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold active:bg-muted"
          >
            <Pencil className="h-4 w-4 text-primary" /> Wax ka beddel
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteTask(actionTask)
              setActionTask(null)
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold text-danger active:bg-muted"
          >
            <Trash2 className="h-4 w-4" /> Tirtir
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTask}
        title="Ma hubtaa inaad tirtirto hawshan?"
        message="Xogta hore waa la hayn doonaa, laakiin maalmaha soo socda kama muuqan doonto."
        confirmLabel="Tirtir"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTask(null)}
      />
    </div>
  )
}
