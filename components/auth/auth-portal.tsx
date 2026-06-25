"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { Login } from "./login"
import { Onboarding } from "./onboarding"
import { ForgotPin } from "./forgot-pin"

export function AuthPortal({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [view, setView] = useState<"welcome" | "login" | "signup" | "forgot">("welcome")

  if (view === "welcome") {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-[#071A3C] px-6 py-10 text-white">
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
              <span>Kusoo dhawoow</span>
              <span className="rounded-full bg-sky-100/15 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-sky-100">
                👋
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
              Siiv Tracker App
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-sm leading-6 text-sky-100/80">
              Ku bilow safarkaaga maalin walba adigoo xisaabta ku haya waxqabadka iyo horumarka.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setView("login")}
              className="rounded-full bg-white px-6 py-4 text-base font-semibold text-[#071A3C] transition hover:bg-sky-100"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setView("signup")}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/20"
            >
              Signup
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex items-center justify-center text-slate-300">
          <span className="font-sans text-sm tracking-wide opacity-90">
            Powered by: Yuusuf Siiv
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-primary px-6 py-6 text-primary-foreground">
      <button
        type="button"
        onClick={() => setView("welcome")}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/15"
      >
        <ArrowLeft className="h-4 w-4" />
        Dib u noqoshada
      </button>

      {view === "login" ? (
        <Login onSuccess={onAuthenticated} onForgot={() => setView("forgot")} />
      ) : view === "forgot" ? (
        <ForgotPin onBack={() => setView("login")} />
      ) : (
        <Onboarding onDone={onAuthenticated} />
      )}
    </div>
  )
}
