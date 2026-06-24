"use client"

import { useState } from "react"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { PinPad } from "@/components/pin-pad"
import { useStore, hashPin, pinToPassword, type PinHistoryEntry } from "@/lib/store"
import { supabase } from "@/lib/supabase"

export function ForgotPin({ onBack }: { onBack: () => void }) {
  const { state, setState, syncProfile } = useStore()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [mismatch, setMismatch] = useState(false)
  const [loading, setLoading] = useState(false)

  function checkEmail() {
    if (email.trim().toLowerCase() === state.user?.email.trim().toLowerCase()) {
      setEmailError("")
      setStep(1)
    } else {
      setEmailError("Email-kan aan laga helin, isku day mar kale")
    }
  }

  async function savePin() {
    setLoading(true)
    const entry: PinHistoryEntry = {
      changedAt: new Date().toISOString(),
      method: "forgot",
      deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    }

    // Update Supabase Auth password
    const newPassword = pinToPassword(pin)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (updateError) {
      console.warn("Could not update Supabase password:", updateError.message)
    }

    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, pin: hashPin(pin) } : prev.user,
      pinHistory: [...prev.pinHistory, entry],
    }))

    await syncProfile()
    setLoading(false)
    setStep(3)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-primary px-6 py-10 text-primary-foreground">
      {step !== 3 && (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 active:scale-95"
          aria-label="Dib u noqo"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      <h1 className="mt-6 text-2xl font-bold">PIN Cusub Samee</h1>

      {step === 0 && (
        <div className="mt-8 flex flex-1 flex-col">
          <label className="text-sm font-medium" htmlFor="fp-email">
            Geli email-ka aad isku diiwaan gelisay
          </label>
          <input
            id="fp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="magac@tusaale.com"
            className="mt-2 w-full rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-base text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:border-gold"
          />
          {emailError && (
            <p className="mt-3 text-sm font-medium text-gold">{emailError}</p>
          )}
          <button
            type="button"
            disabled={!email.includes("@")}
            onClick={checkEmail}
            className="mt-6 rounded-full bg-gold px-6 py-4 text-base font-semibold text-gold-foreground disabled:opacity-40 active:scale-95"
          >
            Sii wad
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 flex flex-1 flex-col items-center text-center">
          <p className="mb-8 text-sm text-primary-foreground/60">
            Samee PIN cusub oo 4-god ah
          </p>
          <PinPad
            value={pin}
            accentDots="light"
            onChange={(v) => {
              setPin(v)
              if (v.length === 4) setTimeout(() => setStep(2), 150)
            }}
          />
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 flex flex-1 flex-col items-center text-center">
          <p className="mb-8 text-sm text-primary-foreground/60">
            Xaqiiji PIN-ka cusub
          </p>
          <PinPad
            value={confirm}
            accentDots="light"
            shake={mismatch}
            onChange={(v) => {
              setMismatch(false)
              setConfirm(v)
              if (v.length === 4) {
                if (v === pin) setTimeout(savePin, 150)
                else {
                  setMismatch(true)
                  setTimeout(() => setConfirm(""), 400)
                }
              }
            }}
          />
          {loading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-primary-foreground/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              La keydiyaa...
            </div>
          )}
          {mismatch && (
            <p className="mt-6 text-sm font-medium text-gold">
              PIN-yadu isku mid maaha, mar kale isku day
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-pop-in flex h-24 w-24 items-center justify-center rounded-full bg-success">
            <Check className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="mt-8 text-xl font-bold">
            PIN-kaaga si guul leh ayaa loo badalay!
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="mt-10 w-full max-w-xs rounded-full bg-gold px-6 py-4 text-base font-semibold text-gold-foreground active:scale-95"
          >
            Gal
          </button>
        </div>
      )}
    </div>
  )
}
