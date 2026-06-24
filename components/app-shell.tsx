"use client"

import { useState } from "react"
import { Logo } from "@/components/logo"
import { useStore } from "@/lib/store"
import { Onboarding } from "@/components/auth/onboarding"
import { Login } from "@/components/auth/login"
import { ForgotPin } from "@/components/auth/forgot-pin"
import { BottomNav, type Screen } from "@/components/bottom-nav"
import { TodayScreen } from "@/components/screens/today-screen"
import { CalendarScreen } from "@/components/screens/calendar-screen"
import { WeeklyScreen } from "@/components/screens/weekly-screen"
import { StatsScreen } from "@/components/screens/stats-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"

export function AppShell() {
  const { state, ready, supabaseUser } = useStore()
  const [authed, setAuthed] = useState(false)
  const [authView, setAuthView] = useState<"login" | "forgot">("login")
  const [screen, setScreen] = useState<Screen>("today")
  const [detailKey, setDetailKey] = useState<string | null>(null)

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

  // No user profile yet — run onboarding
  if (!state.user) {
    return <Onboarding onDone={() => setAuthed(true)} />
  }

  // User exists but not yet authenticated this session
  if (!authed) {
    if (authView === "forgot") {
      return <ForgotPin onBack={() => setAuthView("login")} />
    }
    return (
      <Login
        onSuccess={() => setAuthed(true)}
        onForgot={() => setAuthView("forgot")}
      />
    )
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
        {screen === "today" && <TodayScreen />}
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
