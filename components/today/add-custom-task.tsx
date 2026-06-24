"use client"

import { useState } from "react"
import { CalendarDays, CheckCircle2, Dot } from "lucide-react"
import { BottomSheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SOMALI_DAYS_SHORT } from "@/lib/dates"
import type { CustomTask, Frequency } from "@/lib/store"

export function AddCustomTask({
  open,
  onClose,
  onSave,
  existing,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    frequency: Frequency
    scheduledDays: number[]
  }) => void
  existing?: CustomTask | null
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(existing?.name ?? "")
  const [frequency, setFrequency] = useState<Frequency>(
    existing?.frequency ?? "daily",
  )
  const [days, setDays] = useState<number[]>(existing?.scheduledDays ?? [])

  function reset() {
    setStep(0)
    setName(existing?.name ?? "")
    setFrequency(existing?.frequency ?? "daily")
    setDays(existing?.scheduledDays ?? [])
  }

  function close() {
    onClose()
    setTimeout(reset, 200)
  }

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    )
  }

  function selectSingleDay(d: number) {
    setDays([d])
  }

  const canContinueStep0 = name.trim().length > 0
  const canContinueStep1 =
    frequency === "daily" ||
    (frequency === "custom" && days.length >= 1) ||
    (frequency === "weekly" && days.length === 1)

  function save() {
    onSave({
      name: name.trim(),
      frequency,
      scheduledDays: frequency === "daily" ? [] : days,
    })
    close()
  }

  const summaryDays =
    frequency === "daily"
      ? "Maalin kasta (7 maalin)"
      : days
          .sort((a, b) => a - b)
          .map((d) => SOMALI_DAYS_SHORT[d])
          .join(", ") + ` (${days.length} maalmood)`

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={existing ? "Wax ka beddel hawsha" : "Ku dar Hawl Cusub"}
    >
      {step === 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">
            Magaca hawsha
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tusaale: Cun cunto nafiid ah"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            disabled={!canContinueStep0}
            onClick={() => setStep(1)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40 active:scale-95"
          >
            Sii wad
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Immisa jeer toddobaadkii?
          </p>

          <FreqCard
            active={frequency === "daily"}
            onClick={() => setFrequency("daily")}
            icon={
              <div className="flex gap-0.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-primary" />
                ))}
              </div>
            }
            title="Maalin kasta"
            subtitle="Toddobaadkii 7 maalin"
          />

          <FreqCard
            active={frequency === "custom"}
            onClick={() => setFrequency("custom")}
            icon={<CalendarDays className="h-5 w-5 text-primary" />}
            title="Maalmood gaar ah"
            subtitle="Dooro maalimaha aad rabto"
          />
          {frequency === "custom" && (
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <DayPicker days={days} onToggle={toggleDay} />
              <p className="mt-2 text-xs text-muted-foreground">
                {days.length} maalmood toddobaadkii la doortay
              </p>
            </div>
          )}

          <FreqCard
            active={frequency === "weekly"}
            onClick={() => {
              setFrequency("weekly")
              if (days.length > 1) setDays([days[0]])
            }}
            icon={<Dot className="h-6 w-6 text-primary" />}
            title="Hal mar toddobaadkii"
            subtitle="Dooro hal maalin"
          />
          {frequency === "weekly" && (
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <DayPicker
                days={days}
                single
                onToggle={selectSingleDay}
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold active:bg-muted"
            >
              Dib
            </button>
            <button
              type="button"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40 active:scale-95"
            >
              Sii wad
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Dib u eeg</span>
            </div>
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Hawsha: </span>
              <span className="font-semibold text-foreground">{name}</span>
            </p>
            <p className="mt-1 text-sm">
              <span className="text-muted-foreground">Waqtiga: </span>
              <span className="font-semibold text-foreground">
                {summaryDays}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold active:bg-muted"
            >
              Dib
            </button>
            <button
              type="button"
              onClick={save}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-95"
            >
              Keydi
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}

function FreqCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <span
        className={cn(
          "h-4 w-4 rounded-full border-2",
          active ? "border-primary bg-primary" : "border-border",
        )}
      />
    </button>
  )
}

function DayPicker({
  days,
  onToggle,
  single,
}: {
  days: number[]
  onToggle: (d: number) => void
  single?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SOMALI_DAYS_SHORT.map((label, i) => {
        const active = days.includes(i)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle(i)}
            className={cn(
              "h-10 w-10 rounded-full border text-xs font-semibold transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground",
            )}
            aria-pressed={active}
            aria-label={label + (single ? " (hal)" : "")}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
