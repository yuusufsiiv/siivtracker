"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { PinPad } from "@/components/pin-pad"
import { translations } from "@/lib/translations"
import { getSafeErrorMessage } from "@/lib/utils"
import { useStore, hashPin, pinToPassword } from "@/lib/store"
import { supabase } from "@/lib/supabase"

export function Login({
  onSuccess,
  onForgot,
}: {
  onSuccess: () => void
  onForgot: () => void
}) {
  const { state, setState } = useStore()
  const [email, setEmail] = useState(state.user?.email ?? "")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const t = translations[state.language]
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const locked = lockUntil > now
  const secondsLeft = Math.ceil((lockUntil - now) / 1000)
  const hasLocalProfile = !!state.user?.email
  const online = typeof navigator !== "undefined" ? navigator.onLine : true

  useEffect(() => {
    timer.current = setInterval(() => setNow(Date.now()), 500)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  async function handleChange(v: string) {
    if (locked || loading) return
    setError("")
    setPin(v)
    if (v.length !== 4) return

    const localMatch = hashPin(v) === state.user?.pin

    if (localMatch) {
      setLoading(true)
      const emailToUse = state.user?.email?.trim().toLowerCase()
      if (emailToUse) {
        const password = pinToPassword(v, emailToUse)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password,
        })
        if (signInError) {
          console.error("Supabase Auth Error: re-auth signInWithPassword", signInError)
        }
      }

      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, pin: hashPin(v) } : prev.user,
      }))

      setLoading(false)
      setTimeout(onSuccess, 120)
      return
    }

    if (!online) {
      setError(t.incorrectPin)
      setTimeout(() => setPin(""), 400)
      return
    }

    if (!email.includes("@")) {
      setError(t.enterEmailPin)
      setTimeout(() => setPin(""), 400)
      return
    }

    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()
    const password = pinToPassword(v, normalizedEmail)
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    if (signInError) {
      console.error("Supabase Auth Error: signInWithPassword", signInError)
    }
    if (!authData || (!authData.user && !authData.session?.user)) {
      console.error("Supabase Auth Debug: signInWithPassword returned no user", authData)
    }

    const authUserId = authData?.user?.id || authData?.session?.user?.id
    if (signInError || !authUserId) {
      const message =
        getSafeErrorMessage(signInError) ||
        getSafeErrorMessage(authData) ||
        t.loginError
      setError(message)
      setLoading(false)
      setTimeout(() => setPin(""), 400)
      return
    }

    const userId = authUserId
    const profileRes = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle()
    if (profileRes.error || !profileRes.data) {
      setError(
        getSafeErrorMessage(profileRes.error) ||
          "Ma jiro profile la helay. Fadlan isku day mar kale."
      )
      setLoading(false)
      setTimeout(() => setPin(""), 400)
      return
    }

    const profile = profileRes.data
    setState((prev) => ({
      ...prev,
      user: {
        name: profile.name,
        email: profile.email,
        pin: hashPin(v),
        startDate: profile.start_date,
        createdAt: profile.created_at,
        city: profile.city || "",
        lat: profile.lat,
        lng: profile.lng,
        calcMethod: profile.calc_method || 3,
        notifyMinutesBefore: profile.notify_minutes_before || 5,
        notifications: profile.notifications || {},
      },
    }))

    setLoading(false)
    setTimeout(onSuccess, 120)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-primary px-6 py-10 text-primary-foreground">
      <div className="rounded-3xl bg-primary-foreground/10 p-5">
        <Logo size={64} />
      </div>
      <h1 className="mt-6 text-3xl font-bold leading-tight">
        {hasLocalProfile ? (
          <>
            <span className="block text-base font-semibold text-primary-foreground/70">
              {t.welcome},
            </span>
            <span>{state.user?.name?.split(" ")[0] || ""}</span>
          </>
        ) : (
          t.login
        )}
      </h1>
      <p className="mb-6 mt-1 text-sm text-primary-foreground/60">
        {hasLocalProfile ? t.quickLogin : t.enterEmailPin}
      </p>

      {!hasLocalProfile && (
        <div className="mb-6 w-full max-w-xs">
          <label className="mb-2 block text-sm font-medium text-primary-foreground/70">
            {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-base text-primary-foreground outline-none focus:border-gold"
          />
        </div>
      )}

      <PinPad
        value={pin}
        accentDots="light"
        shake={!!error}
        disabled={locked || loading}
        onChange={handleChange}
      />

      <div className="mt-8 h-10 text-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-primary-foreground/70">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : locked ? (
          <p className="text-sm font-medium text-gold">
            La xidhay. Sug {secondsLeft}s
          </p>
        ) : error ? (
          <p className="animate-fade-in text-sm font-medium text-gold">
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onForgot}
        className="mt-2 text-sm font-medium text-primary-foreground/70 underline-offset-4 hover:underline"
      >
        PIN-ka ma illowday?
      </button>
    </div>
  )
}
