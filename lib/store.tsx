"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  type AppConfig,
  type TaskDef,
  defaultConfig,
} from "@/lib/defaults"
import { toDateKey } from "@/lib/dates"

const STORAGE_KEY = "siiv-track-v1"

export interface UserData {
  name: string
  email: string
  pin: string
  startDate: string
  createdAt: string
  city: string
  lat: number | null
  lng: number | null
  calcMethod: number
  notifyMinutesBefore: number
  notifications: Record<string, boolean>
}

export interface DayData {
  tasks: Record<string, boolean>
  siiga: boolean
  sigayWhy: string
  sigayPrevention: string
  prayerTimes?: Record<string, string>
}

export type Frequency = "daily" | "custom" | "weekly"

export interface CustomTask {
  id: string
  name: string
  frequency: Frequency
  scheduledDays: number[]
  colorTag: string
  createdAt: string
  active: boolean
  deletedAt: string | null
}

export interface WeeklyReview {
  values: Record<string, string>
  savedAt: string
}

export interface PinHistoryEntry {
  changedAt: string
  method: "settings" | "forgot"
  deviceInfo: string
}

export interface AppState {
  user: UserData | null
  days: Record<string, DayData>
  customTasks: Record<string, CustomTask>
  customTaskLogs: Record<string, Record<string, boolean>>
  weeklyReviews: Record<string, WeeklyReview>
  pinHistory: PinHistoryEntry[]
  config: AppConfig
}

function emptyState(): AppState {
  return {
    user: null,
    days: {},
    customTasks: {},
    customTaskLogs: {},
    weeklyReviews: {},
    pinHistory: [],
    config: defaultConfig(),
  }
}

/** Simple non-cryptographic hash for a local-only PIN. */
export function hashPin(pin: string): string {
  let h = 5381
  for (let i = 0; i < pin.length; i++) {
    h = (h * 33) ^ pin.charCodeAt(i)
  }
  return (h >>> 0).toString(16)
}

export function emptyDay(): DayData {
  return { tasks: {}, siiga: true, sigayWhy: "", sigayPrevention: "" }
}

interface StoreContextValue {
  state: AppState
  ready: boolean
  setState: (updater: (prev: AppState) => AppState) => void
  reset: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<AppState>(emptyState)
  const [ready, setReady] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>
        setRawState({
          ...emptyState(),
          ...parsed,
          config: { ...defaultConfig(), ...(parsed.config ?? {}) },
        })
      }
    } catch {
      // ignore corrupt storage
    }
    loaded.current = true
    setReady(true)
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [state])

  // Apply theme to document root.
  useEffect(() => {
    const theme = state.config.theme
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }, [state.config.theme])

  function setState(updater: (prev: AppState) => AppState) {
    setRawState((prev) => updater(prev))
  }

  function reset() {
    const fresh = emptyState()
    setRawState(fresh)
  }

  return (
    <StoreContext.Provider value={{ state, ready, setState, reset }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

/* ----------------------------- Selectors ----------------------------- */

export function getDay(state: AppState, key: string): DayData {
  return state.days[key] ?? emptyDay()
}

export function isTaskDone(day: DayData, taskId: string): boolean {
  return !!day.tasks[taskId]
}

export function activeCustomTasks(state: AppState): CustomTask[] {
  return Object.values(state.customTasks).filter((t) => t.active)
}

export function isScheduled(task: CustomTask, date: Date): boolean {
  if (task.frequency === "daily") return true
  return task.scheduledDays.includes(date.getDay())
}

export function customTasksForDate(state: AppState, date: Date): CustomTask[] {
  return activeCustomTasks(state).filter((t) => isScheduled(t, date))
}

export function isCustomDone(
  state: AppState,
  key: string,
  taskId: string,
): boolean {
  return !!state.customTaskLogs[key]?.[taskId]
}

export interface ScoreResult {
  done: number
  total: number
  pct: number
}

export function computeScore(state: AppState, key: string): ScoreResult {
  const day = getDay(state, key)
  const date = new Date(key + "T00:00:00")
  const cfg = state.config
  let total = 0
  let done = 0

  for (const t of cfg.tasks) {
    if (!t.enabled || !t.countInScore) continue
    total++
    if (day.tasks[t.id]) done++
  }

  for (const ct of customTasksForDate(state, date)) {
    total++
    if (isCustomDone(state, key, ct.id)) done++
  }

  if (cfg.siiga.show && cfg.siiga.countInScore) {
    total++
    if (day.siiga) done++
  }

  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return { done, total, pct }
}

export function todayKeyClient(): string {
  return toDateKey(new Date())
}

export const TASK_BY_ID = (cfg: AppConfig, id: string): TaskDef | undefined =>
  cfg.tasks.find((t) => t.id === id)
