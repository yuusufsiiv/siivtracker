"use client"

import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import { useStore } from "@/lib/store"
import { requestNotificationPermission, scheduleDailyReminder } from "@/lib/notifications"
import { AuthPortal } from "@/components/auth/auth-portal"
import { BottomNav, type Screen } from "@/components/bottom-nav"
import { TodayScreen } from "@/components/screens/today-screen"
import { CalendarScreen } from "@/components/screens/calendar-screen"
import { WeeklyScreen } from "@/components/screens/weekly-screen"
import { StatsScreen } from "@/components/screens/stats-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"

export function AppShell() {
  const { state, ready } = useStore()
  const [authed, setAuthed] = useState(false)
  const [screen, setScreen] = useState<Screen>("today")
  const [detailKey, setDetailKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelReminder: (() => void) | null = null
    async function setupNotifications() {
      if (!authed || !state.user?.name) return
      const permission = await requestNotificationPermission()
      if (permission === "granted") {
        cancelReminder = await scheduleDailyReminder(state.user.name)
      }
    }
    setupNotifications()
    return () => {
      if (cancelReminder) cancelReminder()
    }
  }, [authed, state.user?.name])

  // Loading splash
  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-primary">
        <div className="animate-pop-in">
          <Logo size={72} />
        </div>
      </div>
    )
  }

  if (!state.user || !authed) {
    return <AuthPortal onAuthenticated={() => setAuthed(true)} />
  }

  // Day detail view (from calendar)
  if (detailKey) {
    return (
      <TodayScreen dateKey={detailKey} onBack={() => setDetailKey(null)} />
    )
  }

  // Main app — mobile-first container, centered on desktop
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {screen === "today" && <TodayScreen onOpenSettings={() => setScreen("settings")} />}
        {screen === "grid" && (
          <CalendarScreen onOpenDay={(k) => setDetailKey(k)} />
        )}
        {screen === "weekly" && <WeeklyScreen />}
        {screen === "stats" && (
          <StatsScreen onOpenSettings={() => setScreen("settings")} />
        )}
        {screen === "settings" && (
          <SettingsScreen onLock={() => setAuthed(false)} />
        )}
      </div>
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}
