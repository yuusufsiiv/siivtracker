"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { PinPad } from "@/components/pin-pad"
import { useStore, hashPin, pinToPassword, type UserData } from "@/lib/store"
import { todayKey } from "@/lib/dates"
import { getSafeErrorMessage } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export function Onboarding({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const { setState } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function register() {
    setLoading(true)
    setError("")

    const normalizedEmail = email.trim().toLowerCase()
    const password = pinToPassword(pin, normalizedEmail)

    console.log("Supabase signup attempt", {
      email: normalizedEmail,
      online: typeof window !== "undefined" ? window.navigator.onLine : null,
      origin: typeof window !== "undefined" ? window.location.href : null,
    })

    // Sign up on Supabase Auth — email confirmation is disabled (auto-confirm)
    let data: any = null
    let signUpError: any = null
    try {
      const result = await supabase.auth.signUp(
        {
          email: normalizedEmail,
          password,
        },
        {
          data: { name: name.trim() },
        }
      )
      data = result.data
      signUpError = result.error
    } catch (error) {
      console.error("Supabase Auth Error: signUp threw", error)
      setError(
        "Ma la gaari karin adeega Supabase. Fadlan hubi shabakaddaada iyo xogta URL-ka Supabase, ka dibna isku day mar kale."
      )
      setLoading(false)
      return
    }

    const signUpErrorMessage = getSafeErrorMessage(signUpError)
    if (signUpError) {
      console.error("Supabase Auth Error: signUp", signUpError)
      const signUpDebug =
        signUpErrorMessage ||
        JSON.stringify(signUpError, Object.getOwnPropertyNames(signUpError), 2)

      if (signUpError.message === "User already registered") {
        console.log("Qofkan horay ayaa loo diiwaangeliyay, u gudbi Login.")
        alert("Email-kan horay ayaa loo diiwaangeliyay. Fadlan Login gal.")
        router.push('/login')
        setLoading(false)
        return
      }

      if (
        signUpErrorMessage.includes("already registered") ||
        signUpErrorMessage.includes("already been registered") ||
        signUpErrorMessage.includes("duplicate key") ||
        signUpErrorMessage.includes("already exists")
      ) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        if (signInError) {
          console.error("Supabase Auth Error: signInWithPassword after existing user", signInError)
          setError(
            getSafeErrorMessage(signInError) ||
              "Email-kani horey buu u diiwaan gashan yahay. Haddii PIN-ka aad xasuusan weydo, isticmaal 'PIN-ka ma illowday'."
          )
          setLoading(false)
          return
        }
        if (signInData?.user || signInData?.session?.user) {
          const profileUserId = signInData.user?.id || signInData.session?.user?.id
          if (profileUserId) {
            await saveLocalUser(profileUserId)
            setLoading(false)
            onDone()
            return
          }
        }
      }
      setError(
        signUpErrorMessage ||
          "Diiwaangelinta way ku guuldareysatay. Fadlan hubi email-ka iyo PIN-ka oo mar kale isku day."
      )
      setLoading(false)
      console.log("Supabase signup debug:", signUpDebug)
      return
    }

    const signupUser = data?.user ?? data?.session?.user
    const userId = signupUser?.id

    if (!userId) {
      console.error("Supabase signup returned without a user ID", data)
      setError(
        "Aqoontii waa la abuuray, laakiin weli lama helin aqoonsi user. Fadlan email-kaaga xaqiiji ama mar kale dib isku day."
      )
      setLoading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const activeSessionUserId = sessionData?.session?.user?.id
    const hasSession = Boolean(activeSessionUserId && activeSessionUserId === userId)

    const profileRes = await saveLocalUser(userId, hasSession)
    if (profileRes.error && hasSession) {
      console.warn("Profile save error:", profileRes.error)
      setError(
        getSafeErrorMessage(profileRes.error) ||
          "Ma jiro profile la helay. Fadlan isku day mar kale."
      )
      setLoading(false)
      return
    }

    if (!hasSession) {
      console.warn(
        "Supabase signUp succeeded but no active session was confirmed; user profile saved locally only."
      )
    }

    setLoading(false)
    onDone()
  }

  async function saveLocalUser(userId: string, syncRemote = true) {
    const startDate = todayKey()
    const normalizedEmail = email.trim().toLowerCase()
    const user: UserData = {
      name: name.trim(),
      email: normalizedEmail,
      pin: hashPin(pin),
      startDate,
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

    if (!syncRemote) {
      setState((prev) => ({ ...prev, user }))
      return { data: user, error: null }
    }

    // Save profile to Supabase
    return supabase.from("profiles").upsert({
      user_id: userId,
      name: user.name,
      email: user.email,
      pin: user.pin,
      start_date: user.startDate,
      city: user.city,
      lat: user.lat,
      lng: user.lng,
      calc_method: user.calcMethod,
      notify_minutes_before: user.notifyMinutesBefore,
      notifications: user.notifications,
      config: {},
      updated_at: new Date().toISOString(),
    })
      .then((res) => {
        if (!res.error) setState((prev) => ({ ...prev, user }))
        return res
      })
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
            className="mt-10 flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-gold-foreground active:scale-95 transition-transform"
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
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-gold-foreground disabled:opacity-40 active:scale-95 transition-transform"
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
            {loading && (
              <div className="mt-6 flex items-center gap-2 text-sm text-primary-foreground/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Akoonka la samaynayaa...
              </div>
            )}
            {error && error !== "mismatch" && (
              <p className="mt-6 text-sm font-medium text-gold">{error}</p>
            )}
            {error === "mismatch" && (
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
