"use client"

import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import { translations } from "@/lib/translations"
import { STORAGE_KEY, useStore } from "@/lib/store"

export function Welcome({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const { state, setLanguage, reset } = useStore()
  const [hasLocalUser, setHasLocalUser] = useState(false)
  const t = translations[state.language]

  useEffect(() => {
    if (typeof window === "undefined") return

    const raw = localStorage.getItem(STORAGE_KEY)
    const isLocalhost3000 = window.location.hostname === "localhost" && window.location.port === "3000"

    if (isLocalhost3000) {
      if (raw) {
        reset()
      }
      setHasLocalUser(false)
      return
    }

    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      setHasLocalUser(!!parsed.user)
    } catch {
      setHasLocalUser(false)
    }
  }, [reset])

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#071A3C] px-6 py-10 text-white">
      <button
        type="button"
        onClick={() => setLanguage(state.language === "so" ? "en" : "so")}
        className="absolute right-6 top-6 z-20 rounded-3xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-glass backdrop-blur-xl transition hover:bg-white/20"
      >
        🌐 {t.switchLanguage}
      </button>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <Logo
          size={2200}
          className="absolute top-1/2 left-1/2 h-[140%] w-[140%] min-h-[140%] min-w-[140%] max-h-none max-w-none -translate-x-1/2 -translate-y-1/2 opacity-15 saturate-150 blur-none"
        />
        <div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-br from-slate-950/20 via-slate-900/25 to-slate-950/35 border border-white/10" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-200">
            <span>{t.welcome}</span>
            <span className="rounded-full bg-sky-100/15 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-sky-100">
              👋
            </span>
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
            Siiv Tracker App
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm leading-6 text-sky-100/80">
            {t.welcomeSubtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onLogin}
            className="rounded-full bg-white px-6 py-4 text-base font-semibold text-[#071A3C] transition hover:bg-sky-100"
          >
            {t.login}
          </button>
          <button
            type="button"
            onClick={onSignup}
            className="rounded-full border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/20"
          >
            {t.signup}
          </button>
        </div>

        {hasLocalUser && (
          <p className="mt-6 text-center text-sm text-sky-100/70">
            {t.usedBefore}
          </p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex items-center justify-center text-slate-300">
        <span className="font-sans text-sm tracking-wide opacity-90">
          {t.poweredBy}
        </span>
      </div>
    </div>
  )
}
