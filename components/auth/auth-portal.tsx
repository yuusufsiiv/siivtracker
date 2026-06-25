"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Welcome } from "./welcome"
import { Login } from "./login"
import { Onboarding } from "./onboarding"
import { ForgotPin } from "./forgot-pin"

export function AuthPortal({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [view, setView] = useState<"welcome" | "login" | "signup" | "forgot">("welcome")

  if (view === "welcome") {
    return <Welcome onLogin={() => setView("login")} onSignup={() => setView("signup")} />
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
