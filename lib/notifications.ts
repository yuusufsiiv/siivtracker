const DAILY_REMINDER_KEY = "siiv-track-daily-reminder-date"

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getMillisecondsUntilNinePm(): number {
  const now = new Date()
  const nextReminder = new Date(now)
  nextReminder.setHours(21, 0, 0, 0)
  if (nextReminder <= now) {
    nextReminder.setDate(nextReminder.getDate() + 1)
  }
  return nextReminder.getTime() - now.getTime()
}

async function showNotification(title: string, body: string) {
  if (typeof window === "undefined" || typeof Notification === "undefined") return

  const options: NotificationOptions = {
    body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: "siiv-daily-reminder",
    renotify: true,
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready
      registration.showNotification(title, options)
      return
    }
  } catch {
    // Fallback to the standard Notification API
  }

  new Notification(title, options)
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "denied"
  }

  return Notification.requestPermission()
}

export async function scheduleDailyReminder(name: string): Promise<() => void> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return () => {}
  }
  if (Notification.permission !== "granted") {
    return () => {}
  }

  const today = getTodayDate()
  const lastReminder = localStorage.getItem(DAILY_REMINDER_KEY)
  const firstName = name.split(" ")[0] || "Saaxiib"

  if (lastReminder !== today) {
    const now = new Date()
    if (now.getHours() >= 21) {
      await showNotification(
        "Xusuusin Maalinle",
        `${firstName}, ma xisaabisay dhibcihii maanta?`
      )
      localStorage.setItem(DAILY_REMINDER_KEY, today)
    }
  }

  const timerId = window.setTimeout(async () => {
    await showNotification(
      "Xusuusin Maalinle",
      `${firstName}, ma xisaabisay dhibcihii maanta?`
    )
    localStorage.setItem(DAILY_REMINDER_KEY, getTodayDate())
    scheduleDailyReminder(name)
  }, getMillisecondsUntilNinePm())

  return () => window.clearTimeout(timerId)
}
