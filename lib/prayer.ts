import { toDateKey } from "@/lib/dates"

export type PrayerTimes = Record<string, string>

const CACHE_KEY = "siiv-prayer-cache"

function cleanTime(raw: string): string {
  // Aladhan returns values like "05:12 (EAT)" — keep HH:MM.
  return raw.split(" ")[0].trim()
}

interface CacheShape {
  [key: string]: PrayerTimes
}

function readCache(): CacheShape {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeCache(cache: CacheShape) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
}

export interface FetchArgs {
  date?: Date
  lat?: number | null
  lng?: number | null
  city?: string
  method?: number
}

/** Fetch prayer times from Aladhan, with a per-day local cache. */
export async function fetchPrayerTimes(
  args: FetchArgs,
): Promise<PrayerTimes | null> {
  const date = args.date ?? new Date()
  const dateKey = toDateKey(date)
  const method = args.method ?? 3
  const locKey =
    args.lat != null && args.lng != null
      ? `${args.lat.toFixed(2)},${args.lng.toFixed(2)}`
      : (args.city || "unknown").toLowerCase()
  const cacheKey = `${dateKey}|${locKey}|${method}`

  const cache = readCache()
  if (cache[cacheKey]) return cache[cacheKey]

  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()

  let url = ""
  if (args.lat != null && args.lng != null) {
    url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${args.lat}&longitude=${args.lng}&method=${method}`
  } else if (args.city) {
    url = `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(
      args.city,
    )}&country=&method=${method}`
  } else {
    return null
  }

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const t = json?.data?.timings
    if (!t) return null
    const times: PrayerTimes = {
      fajr: cleanTime(t.Fajr),
      dhuhr: cleanTime(t.Dhuhr),
      asr: cleanTime(t.Asr),
      maghrib: cleanTime(t.Maghrib),
      isha: cleanTime(t.Isha),
    }
    cache[cacheKey] = times
    writeCache(cache)
    return times
  } catch {
    return null
  }
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export interface NextPrayerInfo {
  id: string
  label: string
  time: string
  minutesUntil: number
}

/**
 * Determine the next upcoming prayer based on current time.
 * order: array of {id, label, time}
 */
export function nextPrayer(
  order: { id: string; label: string; time: string }[],
  now: Date,
): NextPrayerInfo | null {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  for (const p of order) {
    if (!p.time) continue
    const min = timeToMinutes(p.time)
    if (min > nowMin) {
      return {
        id: p.id,
        label: p.label,
        time: p.time,
        minutesUntil: min - nowMin,
      }
    }
  }
  // All passed — next is tomorrow's first prayer.
  const first = order.find((p) => p.time)
  if (!first) return null
  const min = timeToMinutes(first.time)
  return {
    id: first.id,
    label: first.label,
    time: first.time,
    minutesUntil: 24 * 60 - nowMin + min,
  }
}

export function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}s ${m}d gudahood`
  return `${m} daqiiqo gudahood`
}
