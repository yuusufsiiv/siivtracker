"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { PinPad } from "@/components/pin-pad"
import { useStore, hashPin, pinToPassword } from "@/lib/store"
import { supabase } from "@/lib/supabase"

export function Login({
  onSuccess,
  onForgot,
}: {
  onSuccess: () => void
  onForgot: () => void
}) {
  const { state } = useStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const locked = lockUntil > now
  const secondsLeft = Math.ceil((lockUntil - now) / 1000)

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

    // First check local PIN hash for instant UX
    const localMatch = hashPin(v) === state.user?.pin

    if (!localMatch) {
      const next = attempts + 1
      setAttempts(next)
      setError("PIN-ka waa khalad, isku day mar kale")
      if (next >= 5) {
        setLockUntil(Date.now() + 30000)
        setAttempts(0)
      }
      setTimeout(() => setPin(""), 400)
      return
    }

    // PIN matches locally — try to sign in to Supabase to refresh the session
    setLoading(true)
    const email = state.user?.email
    if (email) {
      const password = pinToPassword(v)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        // Session refresh failed but local PIN is correct — allow offline login
        console.warn("Supabase re-auth failed, using offline mode:", signInError.message)
      }
    }
    setLoading(false)
    setTimeout(onSuccess, 120)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-primary px-6 py-10 text-primary-foreground">
      <div className="rounded-3xl bg-primary-foreground/10 p-5">
        <Logo size={64} />
      </div>
      <h1 className="mt-6 text-2xl font-bold">
        Ahlan, {state.user?.name?.split(" ")[0] || ""}
      </h1>
      <p className="mb-10 mt-1 text-sm text-primary-foreground/60">
        Geli PIN-kaaga si aad u gasho
      </p>

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
