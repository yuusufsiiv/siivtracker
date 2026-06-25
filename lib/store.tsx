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
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Language } from "@/lib/translations"

export const STORAGE_KEY = "siiv-track-v2"

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
  schedule?: Record<string, unknown> // Custom schedule JSON
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
  language: Language
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
    language: "so",
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

/** Build a Supabase-compatible password from a PIN and email. */
export function pinToPassword(pin: string, email?: string): string {
  const normalizedEmail = (email ?? "anon").trim().toLowerCase()
  const safeEmail = normalizedEmail.replace(/[^a-z0-9@.-]/g, "")
  return `siiv_secure_${safeEmail}_${pin}_tracker_2026`
}

export function emptyDay(): DayData {
  return { tasks: {}, siiga: true, sigayWhy: "", sigayPrevention: "" }
}

// ─────────────────────────────────────────────────────────────
// Supabase sync helpers
// ─────────────────────────────────────────────────────────────

async function fetchRemoteState(userId: string): Promise<Partial<AppState> | null> {
  const [profileRes, daysRes, customTasksRes, logsRes, reviewsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("days_data").select("*").eq("user_id", userId),
      supabase.from("custom_tasks").select("*").eq("user_id", userId),
      supabase.from("custom_task_logs").select("*").eq("user_id", userId),
      supabase.from("weekly_reviews").select("*").eq("user_id", userId),
    ])

  if (profileRes.error) return null
  const profile = profileRes.data
  if (!profile) return null

  const userData: UserData = {
    name: profile.name,
    email: profile.email,
    pin: profile.pin,
    startDate: profile.start_date,
    createdAt: profile.created_at,
    city: profile.city || "",
    lat: profile.lat,
    lng: profile.lng,
    calcMethod: profile.calc_method || 3,
    notifyMinutesBefore: profile.notify_minutes_before || 5,
    notifications: profile.notifications || {},
  }

  const config: AppConfig = profile.config
    ? { ...defaultConfig(), ...(profile.config as AppConfig) }
    : defaultConfig()

  const days: Record<string, DayData> = {}
  for (const row of daysRes.data ?? []) {
    days[String(row.date_key)] = {
      tasks: row.tasks || {},
      siiga: row.siiga,
      sigayWhy: row.sigay_why || "",
      sigayPrevention: row.sigay_prevention || "",
      prayerTimes: row.prayer_times || undefined,
    }
  }

  const customTasks: Record<string, CustomTask> = {}
  for (const row of customTasksRes.data ?? []) {
    customTasks[row.id] = {
      id: row.id,
      name: row.name,
      frequency: row.frequency as Frequency,
      scheduledDays: row.scheduled_days || [],
      schedule: row.schedule || undefined,
      colorTag: row.color_tag || "#4a6fa5",
      createdAt: row.created_at,
      active: row.active,
      deletedAt: row.deleted_at || null,
    }
  }

  const customTaskLogs: Record<string, Record<string, boolean>> = {}
  for (const row of logsRes.data ?? []) {
    const key = String(row.date_key)
    if (!customTaskLogs[key]) customTaskLogs[key] = {}
    customTaskLogs[key][row.task_id] = row.completed
  }

  const weeklyReviews: Record<string, WeeklyReview> = {}
  for (const row of reviewsRes.data ?? []) {
    weeklyReviews[String(row.date_key)] = {
      values: row.values || {},
      savedAt: row.saved_at,
    }
  }

  return { user: userData, days, customTasks, customTaskLogs, weeklyReviews, config }
}

async function pushProfileToRemote(userId: string, state: AppState) {
  if (!state.user) return
  await supabase.from("profiles").upsert({
    user_id: userId,
    name: state.user.name,
    email: state.user.email,
    pin: state.user.pin,
    start_date: state.user.startDate,
    city: state.user.city,
    lat: state.user.lat,
    lng: state.user.lng,
    calc_method: state.user.calcMethod,
    notify_minutes_before: state.user.notifyMinutesBefore,
    notifications: state.user.notifications,
    config: state.config,
    updated_at: new Date().toISOString(),
  })
}

async function pushDayToRemote(userId: string, key: string, day: DayData) {
  await supabase.from("days_data").upsert({
    user_id: userId,
    date_key: key,
    tasks: day.tasks,
    siiga: day.siiga,
    sigay_why: day.sigayWhy,
    sigay_prevention: day.sigayPrevention,
    prayer_times: day.prayerTimes || null,
    updated_at: new Date().toISOString(),
  })
}

async function pushCustomTaskToRemote(userId: string, task: CustomTask) {
  await supabase.from("custom_tasks").upsert({
    user_id: userId,
    id: task.id,
    name: task.name,
    frequency: task.frequency,
    scheduled_days: task.scheduledDays,
    schedule: task.schedule || null,
    color_tag: task.colorTag,
    active: task.active,
    deleted_at: task.deletedAt,
    created_at: task.createdAt,
  })
}

async function pushCustomTaskLogToRemote(
  userId: string,
  dateKey: string,
  taskId: string,
  completed: boolean
) {
  await supabase.from("custom_task_logs").upsert({
    user_id: userId,
    date_key: dateKey,
    task_id: taskId,
    completed,
    updated_at: new Date().toISOString(),
  })
}

async function pushWeeklyReviewToRemote(
  userId: string,
  dateKey: string,
  review: WeeklyReview
) {
  await supabase.from("weekly_reviews").upsert({
    user_id: userId,
    date_key: dateKey,
    values: review.values,
    saved_at: review.savedAt,
  })
}

async function syncAllLocalData(userId: string) {
  if (typeof window !== "undefined" && !window.navigator.onLine) return
  const currentState = stateRef.current
  try {
    await pushProfileToRemote(userId, currentState)
    await Promise.all(
      Object.entries(currentState.days).map(([key, day]) => pushDayToRemote(userId, key, day))
    )
    await Promise.all(
      Object.values(currentState.customTasks).map((task) => pushCustomTaskToRemote(userId, task))
    )
    await Promise.all(
      Object.entries(currentState.customTaskLogs).flatMap(([dateKey, tasks]) =>
        Object.entries(tasks).map(([taskId, completed]) =>
          pushCustomTaskLogToRemote(userId, dateKey, taskId, completed)
        )
      )
    )
    await Promise.all(
      Object.entries(currentState.weeklyReviews).map(([dateKey, review]) =>
        pushWeeklyReviewToRemote(userId, dateKey, review)
      )
    )
  } catch (error) {
    console.warn("Could not sync local data when online:", error)
  }
}

// ─────────────────────────────────────────────────────────────
// Store Context
// ─────────────────────────────────────────────────────────────

interface StoreContextValue {
  state: AppState
  ready: boolean
  supabaseUser: User | null
  isOnline: boolean
  setState: (updater: (prev: AppState) => AppState) => void
  setLanguage: (language: Language) => void
  syncProfile: () => Promise<void>
  syncDay: (key: string) => Promise<void>
  syncCustomTask: (task: CustomTask) => Promise<void>
  syncCustomTaskLog: (dateKey: string, taskId: string, completed: boolean) => Promise<void>
  syncWeeklyReview: (dateKey: string, review: WeeklyReview) => Promise<void>
  reset: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<AppState>(emptyState)
  const [ready, setReady] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const loaded = useRef(false)
  const supabaseUserRef = useRef<User | null>(null)
  const stateRef = useRef<AppState>(emptyState())

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(window.navigator.onLine)
    }

    async function updateOnline() {
      const online = typeof window !== "undefined" ? window.navigator.onLine : true
      setIsOnline(online)
      if (online && supabaseUserRef.current) {
        await syncAllLocalData(supabaseUserRef.current.id)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", updateOnline)
      window.addEventListener("offline", updateOnline)
    }

    // Load local state first for immediate UI
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

    // Check Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      setSupabaseUser(user)
      supabaseUserRef.current = user

      if (user) {
        // Fetch remote state and merge with local changes preserved.
        const remote = await fetchRemoteState(user.id)
        if (remote) {
          setRawState((prev) => ({
            ...prev,
            ...remote,
            user: { ...remote.user, ...prev.user },
            days: { ...remote.days, ...prev.days },
            customTasks: { ...remote.customTasks, ...prev.customTasks },
            customTaskLogs: { ...remote.customTaskLogs, ...prev.customTaskLogs },
            weeklyReviews: { ...remote.weeklyReviews, ...prev.weeklyReviews },
            config: { ...defaultConfig(), ...(remote.config ?? prev.config) },
          }))
        }
      }

      loaded.current = true
      setReady(true)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      setSupabaseUser(user)
      supabaseUserRef.current = user

      if (user) {
        const remote = await fetchRemoteState(user.id)
        if (remote) {
          setRawState((prev) => ({
            ...prev,
            ...remote,
            config: { ...defaultConfig(), ...(remote.config ?? prev.config) },
          }))
        }
      }
    })

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", updateOnline)
        window.removeEventListener("offline", updateOnline)
      }
      subscription.unsubscribe()
    }
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [state])

  // Apply theme to document root
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

  function setLanguage(language: Language) {
    setRawState((prev) => ({ ...prev, language }))
  }

  function reset() {
    const fresh = emptyState()
    setRawState(fresh)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    supabase.auth.signOut()
  }

  async function syncProfile() {
    const user = supabaseUserRef.current
    if (!user || !isOnline) return
    await pushProfileToRemote(user.id, state)
  }

  async function syncDay(key: string) {
    const user = supabaseUserRef.current
    if (!user || !isOnline) return
    const day = state.days[key]
    if (!day) return
    await pushDayToRemote(user.id, key, day)
  }

  async function syncCustomTask(task: CustomTask) {
    const user = supabaseUserRef.current
    if (!user || !isOnline) return
    await pushCustomTaskToRemote(user.id, task)
  }

  async function syncCustomTaskLog(dateKey: string, taskId: string, completed: boolean) {
    const user = supabaseUserRef.current
    if (!user || !isOnline) return
    await pushCustomTaskLogToRemote(user.id, dateKey, taskId, completed)
  }

  async function syncWeeklyReview(dateKey: string, review: WeeklyReview) {
    const user = supabaseUserRef.current
    if (!user || !isOnline) return
    await pushWeeklyReviewToRemote(user.id, dateKey, review)
  }

  return (
    <StoreContext.Provider
      value={{
        state,
        ready,
        supabaseUser,
        isOnline,
        setState,
        setLanguage,
        syncProfile,
        syncDay,
        syncCustomTask,
        syncCustomTaskLog,
        syncWeeklyReview,
        reset,
      }}
    >
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
