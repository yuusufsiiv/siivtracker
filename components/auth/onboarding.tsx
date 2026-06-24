"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { PinPad } from "@/components/pin-pad"
import { useStore, hashPin, type UserData } from "@/lib/store"
import { todayKey } from "@/lib/dates"

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { setState } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")

  function register() {
    const user: UserData = {
      name: name.trim(),
      email: email.trim(),
      pin: hashPin(pin),
      startDate: todayKey(),
      createdAt: new Date().toISOString(),
      city: "",
      lat: null,
      lng: null,
      calcMethod: 3,
      notifyMinutesBefore: 5,
      notifications: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
    }
    setState((prev) => ({ ...prev, user }))
    onDone()
  }

  return (
    <div className="flex min-h-dvh flex-col bg-primary px-6 py-10 text-primary-foreground">
      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-pop-in rounded-3xl bg-primary-foreground/10 p-6">
            <Logo size={96} />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Siiv Track</h1>
          <p className="mt-2 text-lg text-primary-foreground/70">
            90 Day Transformation
          </p>
          <p className="mt-6 max-w-xs text-balance text-sm text-primary-foreground/60">
            Ku bilow safarka isbeddelka. Maalin kasta, tallaabo yar.
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-10 flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-gold-foreground active:scale-95"
          >
            Bilow
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col">
          <BackButton onClick={() => setStep(0)} />
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="text-2xl font-bold">Is barbaadi</h2>
            <p className="mt-1 text-sm text-primary-foreground/60">
              Magacaaga iyo email-kaaga geli.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium" htmlFor="ob-name">
                  Magaca buuxa
                </label>
                <input
                  id="ob-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tusaale: Cabdi Maxamed"
                  className="mt-2 w-full rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-base text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="ob-email">
                  Email
                </label>
                <input
                  id="ob-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="magac@tusaale.com"
                  className="mt-2 w-full rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-base text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={name.trim().length < 2 || !email.includes("@")}
            onClick={() => setStep(2)}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-gold-foreground disabled:opacity-40 active:scale-95"
          >
            Sii wad
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col">
          <BackButton onClick={() => setStep(1)} />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Samee PIN 4-god ah</h2>
            <p className="mt-1 mb-8 text-sm text-primary-foreground/60">
              Tani waxay ilaalin doontaa xogtaada.
            </p>
            <PinPad
              value={pin}
              accentDots="light"
              onChange={(v) => {
                setPin(v)
                if (v.length === 4) {
                  setTimeout(() => setStep(3), 150)
                }
              }}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col">
          <BackButton
            onClick={() => {
              setConfirm("")
              setError("")
              setPin("")
              setStep(2)
            }}
          />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Xaqiiji PIN-ka</h2>
            <p className="mt-1 mb-8 text-sm text-primary-foreground/60">
              Mar kale geli PIN-kaaga.
            </p>
            <PinPad
              value={confirm}
              accentDots="light"
              shake={!!error}
              onChange={(v) => {
                setError("")
                setConfirm(v)
                if (v.length === 4) {
                  if (v === pin) {
                    setTimeout(register, 150)
                  } else {
                    setError("mismatch")
                    setTimeout(() => setConfirm(""), 400)
                  }
                }
              }}
            />
            {error && (
              <p className="mt-6 text-sm font-medium text-gold">
                PIN-yadu isku mid maaha, mar kale isku day.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 active:scale-95"
      aria-label="Dib u noqo"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  )
}
